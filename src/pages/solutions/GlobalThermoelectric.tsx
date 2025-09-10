import { Zap, Globe, Factory, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function GlobalThermoelectric() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="default" className="mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Commercial
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Global Thermoelectric Modules
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Protect your commercial and industrial thermoelectric innovations across global markets 
              with comprehensive IP security, manufacturing protection, and supply chain monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Global Protection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Global Thermoelectric Market Protection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive IP protection for the rapidly growing global thermoelectric industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">$1.2B</div>
              <div className="text-sm text-muted-foreground">Global Market Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">12.3%</div>
              <div className="text-sm text-muted-foreground">Annual Growth Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-sm text-muted-foreground">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Global Monitoring</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-fit">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>International IP Protection</CardTitle>
                <CardDescription>
                  Multi-jurisdictional patent protection and enforcement across global markets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> USPTO, EPO, WIPO coordination</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> PCT application management</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Regional patent strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-secondary/10 rounded-lg w-fit">
                  <Factory className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Manufacturing Security</CardTitle>
                <CardDescription>
                  Protect manufacturing processes, quality control methods, and production innovations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Process documentation protection</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Quality control IP security</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Production line monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-lg w-fit">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Supply Chain Monitoring</CardTitle>
                <CardDescription>
                  Monitor global supply chains for IP violations and unauthorized technology transfer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Supplier IP compliance</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Counterfeit detection</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Technology transfer tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Applications */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Commercial Applications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Automotive Industry</CardTitle>
                <CardDescription>Waste heat recovery and cabin climate control</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Exhaust heat recovery systems</li>
                  <li>• Seat heating and cooling</li>
                  <li>• Battery thermal management</li>
                  <li>• HVAC efficiency improvements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Industrial Manufacturing</CardTitle>
                <CardDescription>Process efficiency and waste heat utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Steel and aluminum processing</li>
                  <li>• Chemical plant heat recovery</li>
                  <li>• Glass manufacturing cooling</li>
                  <li>• Cement production efficiency</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consumer Electronics</CardTitle>
                <CardDescription>Device cooling and power generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Smartphone thermal management</li>
                  <li>• Laptop cooling solutions</li>
                  <li>• Wearable power generation</li>
                  <li>• IoT device energy harvesting</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Energy & Utilities</CardTitle>
                <CardDescription>Power generation and grid efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Solar panel efficiency enhancement</li>
                  <li>• Industrial waste heat recovery</li>
                  <li>• Geothermal power optimization</li>
                  <li>• Grid storage thermal management</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aerospace & Aviation</CardTitle>
                <CardDescription>Aircraft and spacecraft thermal systems</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Engine waste heat recovery</li>
                  <li>• Cabin thermal management</li>
                  <li>• Satellite power systems</li>
                  <li>• Avionics cooling solutions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Medical Devices</CardTitle>
                <CardDescription>Precision cooling and power systems</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Medical imaging equipment cooling</li>
                  <li>• Therapeutic device thermal control</li>
                  <li>• Portable medical device power</li>
                  <li>• Laboratory equipment cooling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Global Market Protection
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive IP protection across all major thermoelectric markets worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">North America</CardTitle>
                <CardDescription>United States, Canada, Mexico</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">$420M</div>
                <div className="text-sm text-muted-foreground">Market Size</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Europe</CardTitle>
                <CardDescription>EU, UK, Switzerland, Norway</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">$340M</div>
                <div className="text-sm text-muted-foreground">Market Size</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Asia Pacific</CardTitle>
                <CardDescription>China, Japan, South Korea, India</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">$310M</div>
                <div className="text-sm text-muted-foreground">Market Size</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-lg">Rest of World</CardTitle>
                <CardDescription>Latin America, Middle East, Africa</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">$130M</div>
                <div className="text-sm text-muted-foreground">Market Size</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/10">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Protect Your Global Thermoelectric Innovation
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start comprehensive IP protection for your commercial thermoelectric technologies today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg">
                Start Global Protection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Download Market Report
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}