import { Button, Card, CardContent, CardHeader } from "@acrely/ui";
import { Building2, Users, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary-700 mb-4">
            Welcome to Acrely v2
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Professional Real Estate Management Platform
          </p>
          <p className="text-lg text-gray-500">
            Powered by Pinnacle Builders Homes & Properties
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card hover className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Building2 size={48} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">8</h3>
              <p className="text-gray-600">Active Estates</p>
            </CardHeader>
          </Card>

          <Card hover className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <MapPin size={48} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">24</h3>
              <p className="text-gray-600">Available Plots</p>
            </CardHeader>
          </Card>

          <Card hover className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
              <p className="text-gray-600">Customers</p>
            </CardHeader>
          </Card>

          <Card hover className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <DollarSign size={48} className="text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">₦0</h3>
              <p className="text-gray-600">Total Revenue</p>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Set up your first admin account</h3>
                  <p className="text-gray-600">Create an admin user to manage the platform</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add your agents</h3>
                  <p className="text-gray-600">Invite your sales agents to the platform</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary-100 text-primary-700 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start managing properties</h3>
                  <p className="text-gray-600">Begin tracking customers, allocations, and payments</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2025 Pinnacle Builders Homes & Properties. All rights reserved.</p>
          <p className="mt-2">
            Built with ❤️ by Landon Digital | Acrely v2.0.0
          </p>
        </div>
      </div>
    </main>
  );
}
