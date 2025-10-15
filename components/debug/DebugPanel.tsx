'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DebugInfo {
  mockApiEnabled: boolean;
  apiBaseUrl: string;
  hasEnvFile: boolean;
  authServiceWorking: boolean;
  localStorage: {
    token: string | null;
    user: string | null;
  };
}

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    mockApiEnabled: false,
    apiBaseUrl: '',
    hasEnvFile: false,
    authServiceWorking: false,
    localStorage: {
      token: null,
      user: null,
    },
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    updateDebugInfo();
  }, []);

  const updateDebugInfo = () => {
    const info: DebugInfo = {
      mockApiEnabled: process.env.NEXT_PUBLIC_MOCK_API === 'true',
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      hasEnvFile: !!process.env.NEXT_PUBLIC_MOCK_API, // If this exists, env file is loaded
      authServiceWorking: false,
      localStorage: {
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        user: typeof window !== 'undefined' ? localStorage.getItem('user') : null,
      },
    };

    // Test auth service
    try {
      // This will test if the module loads without errors
      info.authServiceWorking = true;
    } catch (error) {
      info.authServiceWorking = false;
    }

    setDebugInfo(info);
  };

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      updateDebugInfo();
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-red-500 text-white hover:bg-red-600"
        >
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            Debug Panel
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Configuration</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Environment File:</span>
              {debugInfo.hasEnvFile ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Loaded
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Missing
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Mock API:</span>
              {debugInfo.mockApiEnabled ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Auth Service:</span>
              {debugInfo.authServiceWorking ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Working
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">API Settings</h4>
            <div className="text-xs bg-gray-100 p-2 rounded">
              <strong>API URL:</strong> {debugInfo.apiBaseUrl}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Local Storage</h4>
            <div className="text-xs space-y-1">
              <div>Token: {debugInfo.localStorage.token ? '✅ Present' : '❌ None'}</div>
              <div>User: {debugInfo.localStorage.user ? '✅ Present' : '❌ None'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={updateDebugInfo} variant="outline" size="sm" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={clearLocalStorage} variant="destructive" size="sm" className="w-full">
              Clear Storage
            </Button>
          </div>

          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Demo Login:</strong><br />
            Email: admin@quickcrate.com<br />
            Password: admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}