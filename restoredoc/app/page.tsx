import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Flame, Wind } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="font-bold text-xl text-slate-900">RestoreDoc</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            AI-Powered Restoration Estimates
            <span className="block text-blue-600 mt-2">in Seconds</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Upload photos of damage, get professional estimates instantly. 
            Built for restoration contractors who value speed and accuracy.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Complete Restoration Coverage
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our AI analyzes damage photos and generates insurance-compliant estimates 
            following IICRC standards.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Water Damage Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Water Damage</CardTitle>
              <CardDescription className="text-base">
                Category 1-3 water loss assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  IICRC S500 compliant
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Moisture mapping & documentation
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  Equipment & drying calculations
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  $3-9/sq ft regional pricing
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Fire Damage Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Fire Damage</CardTitle>
              <CardDescription className="text-base">
                Smoke & structural fire assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  IICRC S700 compliant
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  Smoke residue classification
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  Content restoration itemization
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-2">✓</span>
                  $3-50/sq ft based on severity
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Mold Damage Card */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Wind className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Mold Remediation</CardTitle>
              <CardDescription className="text-base">
                Condition 1-3 mold assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  IICRC S520 compliant
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Species identification
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Containment & air scrubbing
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Level 1-4 pricing matrices
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Contractors Choose RestoreDoc
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2">5-Second Analysis</h3>
              <p className="text-sm text-slate-600">
                Upload photos and get estimates faster than ever before
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-semibold text-lg mb-2">Insurance Ready</h3>
              <p className="text-sm text-slate-600">
                Generate detailed reports that insurance companies accept
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="font-semibold text-lg mb-2">York PA Pricing</h3>
              <p className="text-sm text-slate-600">
                Accurate regional pricing for your local market
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-lg mb-2">Works Anywhere</h3>
              <p className="text-sm text-slate-600">
                Access from phone, tablet, or desktop at the job site
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Estimation Process?
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            Join restoration contractors who are saving hours on every estimate.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="mt-4 text-sm text-blue-200">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="font-bold text-slate-900">RestoreDoc</span>
            </div>
            <div className="text-sm text-slate-600">
              © 2024 RestoreDoc. Built for Major Restoration Services, York PA.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
