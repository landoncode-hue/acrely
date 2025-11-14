import { Button, Card, CardContent, CardHeader } from "@acrely/ui";
import { Building2, Users, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-6">
            <span className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-pulse"></span>
            Version 2.0 • Production Ready
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            Acrely<span className="text-primary-600">.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-3 max-w-2xl mx-auto font-medium">
            Professional Real Estate Management Platform
          </p>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            Powered by Pinnacle Builders Homes & Properties
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <Card hover className="group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                  <Building2 className="w-10 h-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">8</h3>
              <p className="text-sm text-slate-600 font-medium">Active Estates</p>
            </CardHeader>
          </Card>

          <Card hover className="group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                  <MapPin className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">24</h3>
              <p className="text-sm text-slate-600 font-medium">Available Plots</p>
            </CardHeader>
          </Card>

          <Card hover className="group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">0</h3>
              <p className="text-sm text-slate-600 font-medium">Customers</p>
            </CardHeader>
          </Card>

          <Card hover className="group">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <DollarSign className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">₦0</h3>
              <p className="text-sm text-slate-600 font-medium">Total Revenue</p>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-3xl mx-auto border-slate-200/60 shadow-xl shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">Getting Started</h2>
            <p className="text-sm text-slate-600 mt-1">Follow these steps to set up your platform</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 shadow-sm text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Set up your first admin account</h3>
                  <p className="text-sm text-slate-600">Create an admin user to manage the platform</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 shadow-sm text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Add your agents</h3>
                  <p className="text-sm text-slate-600">Invite your sales agents to the platform</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold flex-shrink-0 shadow-sm text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">Start managing properties</h3>
                  <p className="text-sm text-slate-600">Begin tracking customers, allocations, and payments</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/login" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto">Sign In</Button>
              </Link>
              <Link href="/dashboard" className="flex-1 sm:flex-none">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 sm:mt-20 text-center text-slate-500 text-sm">
          <p className="font-medium">© 2025 Pinnacle Builders Homes & Properties. All rights reserved.</p>
          <p className="mt-2 text-slate-400">
            Built with ❤️ by <span className="text-primary-600 font-semibold">Landon Digital</span> • Acrely v2.0.0
          </p>
        </div>
      </div>
    </main>
  );
}
