import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DemoModeCallout() {
  return (
    <Card className="border-4 border-orange-400 bg-orange-50 shadow-[8px_8px_0px_0px_rgba(251,146,60,1)] mb-6">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">🔒</div>
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-bold text-orange-800">
              Demo Mode - Adding Disabled
            </h3>
            <p className="text-orange-700 font-medium">
              This Commonbase is for demonstration purposes only. You can explore existing entries 
              but cannot add new content.
            </p>
            <div className="pt-2">
              <Button 
                asChild 
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                <a 
                  href="https://github.com/your-commonbase/commonbase" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Create Your Own Commonbase →
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}