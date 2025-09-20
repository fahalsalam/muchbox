import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePostSetting } from '@/hooks/mutations/usePostSetting';
import { showToast } from '@/lib/toast';

/**
 * Demo component showing how the looped POST settings API works
 * This demonstrates posting multiple settings individually in a loop
 */
export function SettingsDemo() {
  const [isPosting, setIsPosting] = useState(false);
  const postSettingMutation = usePostSetting();

  const handlePostAllSettings = async () => {
    try {
      setIsPosting(true);
      
      // Settings array - same as in the main updateSettings function
      const settingsArray = [
        { settingKey: 'DayCutOffTime', settingValue: '14:30' },
        { settingKey: 'NightCutOffTime', settingValue: '22:00' }
      ];

      console.log('🔄 Starting to post settings in loop...');
      
      // Loop through each setting and post individually
      for (const setting of settingsArray) {
        console.log(`📤 Posting: ${setting.settingKey} = ${setting.settingValue}`);
        
        // Post each setting individually using the mutation
        await postSettingMutation.mutateAsync(setting);
        
        // Small delay between requests (optional)
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      showToast.success('All settings posted successfully via loop!');
      console.log('✅ All settings posted successfully');
      
    } catch (error) {
      console.error('❌ Error posting settings:', error);
      showToast.error('Failed to post some settings');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Settings POST Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>This demonstrates the POST API loop:</p>
          <ul className="list-disc ml-4 mt-2">
            <li>DayCutOffTime: 14:30</li>
            <li>NightCutOffTime: 22:00</li>
          </ul>
        </div>
        
        <Button 
          onClick={handlePostAllSettings}
          disabled={isPosting || postSettingMutation.isPending}
          className="w-full"
        >
          {isPosting ? 'Posting Settings...' : 'POST All Settings (Loop)'}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p>API Endpoint: <code>POST /api/DQ/postSettings</code></p>
          <p>Method: Loop through 2 settings</p>
        </div>
      </CardContent>
    </Card>
  );
}
