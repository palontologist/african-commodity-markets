import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle>Commodity Not Found</CardTitle>
          <CardDescription>The requested commodity market does not exist or is not available.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">Available markets: Tea, Coffee, Avocado, and Macadamia</p>
          <Button asChild>
            <Link href="/">Return to Markets</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
