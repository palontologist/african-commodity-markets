import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Award, CheckCircle, Info, TrendingUp } from "lucide-react"
import Link from "next/link"

const qualityGrades = {
  tea: {
    name: "Tea Quality Grades",
    description: "East African Tea Trade Association (EATTA) standards",
    icon: "🍃",
    grades: [
      {
        name: "OP (Orange Pekoe)",
        description: "Whole leaf tea with long, wiry leaves",
        characteristics: ["Large leaf size", "Minimal broken pieces", "Strong flavor profile"],
        priceRange: "$2.80 - $3.20/kg",
        marketShare: 15,
        color: "bg-green-100 text-green-800",
      },
      {
        name: "BOP (Broken Orange Pekoe)",
        description: "Broken leaf tea, most common grade",
        characteristics: ["Medium leaf size", "Good liquoring quality", "Balanced flavor"],
        priceRange: "$2.40 - $2.80/kg",
        marketShare: 45,
        color: "bg-green-100 text-green-800",
      },
      {
        name: "Fannings",
        description: "Small leaf particles, quick brewing",
        characteristics: ["Small particle size", "Strong color", "Quick extraction"],
        priceRange: "$2.00 - $2.40/kg",
        marketShare: 30,
        color: "bg-amber-100 text-amber-800",
      },
      {
        name: "Dust",
        description: "Finest particles, used in tea bags",
        characteristics: ["Very fine particles", "Instant color", "Commercial use"],
        priceRange: "$1.60 - $2.00/kg",
        marketShare: 10,
        color: "bg-orange-100 text-orange-800",
      },
    ],
    sources: ["Kenya Tea Board", "Tanzania Tea Board", "Malawi Tea Association"],
    standards: "EATTA grading system based on leaf size, appearance, and liquoring quality",
  },
  coffee: {
    name: "Coffee Quality Grades",
    description: "Specialty Coffee Association (SCA) scoring system",
    icon: "☕",
    grades: [
      {
        name: "Specialty (84+)",
        description: "Exceptional coffee with distinct characteristics",
        characteristics: ["SCA score 84-100", "No defects", "Unique flavor profile"],
        priceRange: "$5.50 - $8.00/lb",
        marketShare: 20,
        color: "bg-green-100 text-green-800",
      },
      {
        name: "Premium (80-84)",
        description: "High-quality coffee with good characteristics",
        characteristics: ["SCA score 80-84", "Minor defects allowed", "Good flavor balance"],
        priceRange: "$4.00 - $5.50/lb",
        marketShare: 35,
        color: "bg-amber-100 text-amber-800",
      },
      {
        name: "Commercial (<80)",
        description: "Standard commercial grade coffee",
        characteristics: ["SCA score below 80", "Some defects present", "Basic flavor profile"],
        priceRange: "$2.50 - $4.00/lb",
        marketShare: 45,
        color: "bg-orange-100 text-orange-800",
      },
    ],
    sources: ["Ethiopian Commodity Exchange", "Nairobi Coffee Exchange", "ICO"],
    standards:
      "SCA cupping protocol with 100-point scale evaluating aroma, flavor, aftertaste, acidity, body, balance, and overall impression",
  },
  avocado: {
    name: "Avocado Export Grades",
    description: "Kenya Plant Health Inspectorate Service (KEPHIS) standards",
    icon: "🥑",
    grades: [
      {
        name: "Grade A (Premium)",
        description: "Perfect shape, no defects, premium export quality",
        characteristics: ["Uniform shape", "No blemishes", "Optimal size 200-300g"],
        priceRange: "$2.20 - $2.80/kg",
        marketShare: 40,
        color: "bg-green-100 text-green-800",
      },
      {
        name: "Grade B (Standard)",
        description: "Good quality with minor imperfections",
        characteristics: ["Slight shape variations", "Minor skin marks", "Size 150-250g"],
        priceRange: "$1.60 - $2.20/kg",
        marketShare: 50,
        color: "bg-amber-100 text-amber-800",
      },
      {
        name: "Grade C (Processing)",
        description: "Processing grade for value-added products",
        characteristics: ["Shape irregularities", "Surface defects", "Various sizes"],
        priceRange: "$1.00 - $1.60/kg",
        marketShare: 10,
        color: "bg-orange-100 text-orange-800",
      },
    ],
    sources: ["KEPHIS", "Fresh Produce Exporters Association of Kenya"],
    standards: "Based on size, shape, skin quality, and absence of defects according to international export standards",
  },
  macadamia: {
    name: "Macadamia Quality Grades",
    description: "Macadamia Quality Assurance (MQA) international standards",
    icon: "🌰",
    grades: [
      {
        name: "MQA_I (Premium)",
        description: "Highest quality with perfect kernels",
        characteristics: ["Whole kernels", "Light color", "Moisture <1.5%"],
        priceRange: "$14.00 - $16.00/kg",
        marketShare: 30,
        color: "bg-green-100 text-green-800",
      },
      {
        name: "MQA_II (Standard)",
        description: "Good quality with minor imperfections",
        characteristics: ["Mostly whole kernels", "Slight color variation", "Moisture <2.0%"],
        priceRange: "$11.00 - $14.00/kg",
        marketShare: 50,
        color: "bg-amber-100 text-amber-800",
      },
      {
        name: "MQA_III (Processing)",
        description: "Processing grade for value-added products",
        characteristics: ["Broken pieces allowed", "Color variations", "Moisture <2.5%"],
        priceRange: "$8.00 - $11.00/kg",
        marketShare: 20,
        color: "bg-orange-100 text-orange-800",
      },
    ],
    sources: ["SA Macadamia Growers Association", "Kenya Nut Company"],
    standards: "International MQA standards based on kernel integrity, color, moisture content, and defect levels",
  },
}

export default function QualityGradesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Markets
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quality Grades System</h1>
                <p className="text-sm text-muted-foreground">African commodity quality standards and grading</p>
              </div>
            </div>
            <Button>Connect Wallet</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">Understanding Quality Grades</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            Learn about the quality standards that drive our prediction markets. Each commodity follows internationally
            recognized grading systems used by African export boards and trade associations.
          </p>
        </div>

        {/* Quality Grades Tabs */}
        <Tabs defaultValue="tea" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tea">Tea</TabsTrigger>
            <TabsTrigger value="coffee">Coffee</TabsTrigger>
            <TabsTrigger value="avocado">Avocado</TabsTrigger>
            <TabsTrigger value="macadamia">Macadamia</TabsTrigger>
          </TabsList>

          {Object.entries(qualityGrades).map(([key, commodity]) => (
            <TabsContent key={key} value={key} className="mt-8">
              <div className="space-y-8">
                {/* Commodity Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{commodity.icon}</div>
                      <div>
                        <CardTitle className="text-2xl">{commodity.name}</CardTitle>
                        <CardDescription className="text-lg">{commodity.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Grading Standards</h4>
                        <p className="text-muted-foreground text-pretty">{commodity.standards}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Data Sources</h4>
                        <div className="flex flex-wrap gap-2">
                          {commodity.sources.map((source, index) => (
                            <Badge key={index} variant="outline">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grade Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {commodity.grades.map((grade, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{grade.name}</CardTitle>
                          <Badge className={grade.color}>Grade {index + 1}</Badge>
                        </div>
                        <CardDescription>{grade.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h5 className="font-medium text-foreground mb-2">Key Characteristics</h5>
                          <ul className="space-y-1">
                            {grade.characteristics.map((char, charIndex) => (
                              <li key={charIndex} className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span>{char}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Price Range</p>
                            <p className="font-semibold text-foreground">{grade.priceRange}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Market Share</p>
                            <p className="font-semibold text-foreground">{grade.marketShare}%</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Market Presence</span>
                            <span className="text-sm font-medium text-foreground">{grade.marketShare}%</span>
                          </div>
                          <Progress value={grade.marketShare} className="h-2" />
                        </div>

                        <Button asChild className="w-full">
                          <Link href={`/marketplace/${key}`}>View {commodity.name.split(" ")[0]} Markets</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* How Grading Affects Markets */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="w-5 h-5" />
                      <span>How Grading Affects Prediction Markets</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">Price Determination</h4>
                        <p className="text-sm text-muted-foreground text-pretty">
                          Higher grades command premium prices, directly affecting market predictions and settlement
                          values.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Award className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">Quality Thresholds</h4>
                        <p className="text-sm text-muted-foreground text-pretty">
                          Markets often predict whether certain quality percentages will be achieved by specific dates.
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-foreground mb-2">Settlement Data</h4>
                        <p className="text-sm text-muted-foreground text-pretty">
                          Official grade certifications from export boards provide the data for market settlement.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Start Trading?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-pretty">
                Now that you understand the quality grading systems, explore our active prediction markets and start
                making informed trades based on African commodity standards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/">Explore Markets</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/marketplace/tea">Start with Tea</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
