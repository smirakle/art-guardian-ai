import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

export const PartnerSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-green-700 dark:text-green-300">
            Welcome to TSMO Partner Program!
          </h1>
          <p className="text-xl text-green-600 dark:text-green-400">
            Your subscription has been activated successfully
          </p>
        </div>

        {/* Success Details */}
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Subscription Confirmed</span>
            </CardTitle>
            <CardDescription>
              Your partner subscription is now active and ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Next Steps</span>
              </h3>
              <div className="grid gap-3">
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Set Up API Keys</h4>
                    <p className="text-sm text-muted-foreground">
                      Create your API keys to start integrating with our enterprise endpoints
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Configure White Label</h4>
                    <p className="text-sm text-muted-foreground">
                      Customize your organization settings and branding options
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Start Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Begin integrating our AI protection APIs into your platform
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Partner Support</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Dedicated Support
                  </Badge>
                  <p className="text-sm text-muted-foreground text-center">
                    Priority support with dedicated account manager
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Revenue Sharing
                  </Badge>
                  <p className="text-sm text-muted-foreground text-center">
                    Earn revenue through our partner program
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a 
                href="/enterprise-api"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg text-center font-medium transition-colors"
              >
                Go to Enterprise API
              </a>
              <a 
                href="/partner-pricing"
                className="flex-1 border border-primary text-primary hover:bg-primary/5 px-6 py-3 rounded-lg text-center font-medium transition-colors"
              >
                View Subscription Details
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need help getting started? Check out our{' '}
            <a href="/help-center" className="text-primary hover:underline">
              documentation
            </a>{' '}
            or{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};