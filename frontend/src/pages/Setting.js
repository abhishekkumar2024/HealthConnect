import { useState } from 'react';
import { useDarkMode } from '../contextAPI/contextApi';
import { Card, CardHeader, CardTitle, CardContent } from "../utilities/cards/Card";
import { Bell, Shield, Mail, ChevronRight, Moon, Sun, User } from 'lucide-react'

const SettingsPage = () => {

    const { themeStyles } = useDarkMode();


  return (
     <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className={`text-2xl font-bold ${themeStyles.text}`}>Settings</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
          <CardHeader>
            <CardTitle className={`text-lg ${themeStyles.text}`}>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: User, title: 'Profile Information', desc: 'Update your personal details' },
              { icon: Bell, title: 'Notifications', desc: 'Manage your alert preferences' },
              { icon: Shield, title: 'Privacy & Security', desc: 'Control your account security' },
              { icon: Mail, title: 'Communication', desc: 'Set your contact preferences' }
            ].map((setting, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 ${themeStyles.accentBg} rounded-lg`}>
                <div className="flex items-center gap-4">
                  <setting.icon className={themeStyles.accentText} size={20} />
                  <div>
                    <h3 className={`font-medium ${themeStyles.text}`}>{setting.title}</h3>
                    <p className={`text-sm ${themeStyles.subtext}`}>{setting.desc}</p>
                  </div>
                </div>
                <ChevronRight className={themeStyles.subtext} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={`${themeStyles.cardBg} ${themeStyles.border} border`}>
          <CardHeader>
            <CardTitle className={`text-lg ${themeStyles.text}`}>Preferences</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export { SettingsPage };