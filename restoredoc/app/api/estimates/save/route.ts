import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      jobId,
      projectInfo,
      damageType,
      lineItems,
      subtotal,
      markupPercent,
      markupAmount,
      totalEstimate,
      adjustments,
      aiAnalysis,
      photos
    } = body;

    // Start a transaction
    let job;
    let estimate;

    // If no jobId, create a new job first
    if (!jobId) {
      if (!projectInfo || !projectInfo.clientName || !projectInfo.propertyAddress) {
        return NextResponse.json(
          { error: 'Project information required for new job' },
          { status: 400 }
        );
      }

      // First check if contractor exists, if not create one
      const { data: contractor, error: contractorError } = await supabase
        .from('contractors')
        .select('id')
        .eq('id', user.id)
        .single();

      if (contractorError || !contractor) {
        // Create contractor profile if it doesn't exist
        const { error: createContractorError } = await supabase
          .from('contractors')
          .insert({
            id: user.id,
            email: user.email || '',
            business_name: projectInfo.companyName || 'My Restoration Company'
          });

        if (createContractorError) {
          console.error('Error creating contractor:', createContractorError);
          return NextResponse.json(
            { error: 'Failed to create contractor profile' },
            { status: 500 }
          );
        }
      }

      // Create new job
      const { data: newJob, error: jobError } = await supabase
        .from('jobs')
        .insert({
          contractor_id: user.id,
          customer_name: projectInfo.clientName,
          customer_email: projectInfo.clientEmail || null,
          customer_phone: projectInfo.clientPhone || null,
          damage_type: damageType,
          property_address: projectInfo.propertyAddress,
          property_city: projectInfo.propertyCity || 'York',
          property_state: projectInfo.propertyState || 'PA',
          property_zip: projectInfo.propertyZip || null,
          notes: projectInfo.notes || null
        })
        .select()
        .single();

      if (jobError) {
        console.error('Error creating job:', jobError);
        return NextResponse.json(
          { error: 'Failed to create job' },
          { status: 500 }
        );
      }

      job = newJob;
    } else {
      // Verify job exists and belongs to user
      const { data: existingJob, error: jobFetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('contractor_id', user.id)
        .single();

      if (jobFetchError || !existingJob) {
        return NextResponse.json(
          { error: 'Job not found or unauthorized' },
          { status: 404 }
        );
      }

      job = existingJob;
    }

    // Mark any existing estimates for this job as not current
    if (job.id) {
      await supabase
        .from('estimates')
        .update({ is_current: false })
        .eq('job_id', job.id);
    }

    // Create new estimate
    const { data: newEstimate, error: estimateError } = await supabase
      .from('estimates')
      .insert({
        job_id: job.id,
        version: 1, // We could increment this based on existing estimates
        is_current: true,
        ai_analysis: aiAnalysis || null,
        photos: photos || null,
        line_items: lineItems,
        subtotal: subtotal,
        markup_percent: markupPercent || 0,
        markup_amount: markupAmount || 0,
        total: totalEstimate,
        adjustments: adjustments || null,
        labor_rate: adjustments?.laborRate || 95,
        equipment_days: adjustments?.equipmentDays || 3,
        status: 'draft',
        created_by: user.id
      })
      .select()
      .single();

    if (estimateError) {
      console.error('Error creating estimate:', estimateError);
      return NextResponse.json(
        { error: 'Failed to save estimate' },
        { status: 500 }
      );
    }

    estimate = newEstimate;

    return NextResponse.json({
      success: true,
      job,
      estimate,
      message: 'Estimate saved successfully'
    });

  } catch (error) {
    console.error('Save estimate error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save estimate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve estimates
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const estimateId = searchParams.get('estimateId');

    let query = supabase
      .from('estimates')
      .select(`
        *,
        jobs (
          *,
          contractors (
            business_name,
            email,
            phone
          )
        )
      `);

    if (estimateId) {
      query = query.eq('id', estimateId).single();
    } else if (jobId) {
      query = query.eq('job_id', jobId).eq('is_current', true);
    } else {
      // Get all current estimates for the user's jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('contractor_id', user.id);
      
      if (jobs) {
        const jobIds = jobs.map(j => j.id);
        query = query.in('job_id', jobIds).eq('is_current', true);
      }
    }

    const { data: estimates, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching estimates:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch estimates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      estimates
    });

  } catch (error) {
    console.error('Fetch estimates error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch estimates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}