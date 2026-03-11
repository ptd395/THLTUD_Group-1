import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SentimentConfig, analyzeSentiment, getSentimentColor } from '@/lib/sentiment';
import { useSentiment } from '@/contexts/SentimentContext';
import { RotateCcw, Save, Mic } from 'lucide-react';
import VoiceModal from './VoiceModal';

export function SentimentConfigForm() {
  const { config, updateConfig, resetConfig } = useSentiment();
  const [localConfig, setLocalConfig] = useState<SentimentConfig>(config);
  const [previewText, setPreviewText] = useState('');
  const [previewLanguage, setPreviewLanguage] = useState<'vi' | 'en'>('en');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleSave = () => {
    updateConfig(localConfig);
    alert('Configuration saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default configuration?')) {
      resetConfig();
      setLocalConfig(config);
    }
  };

  const handlePreview = () => {
    if (!previewText.trim()) return;
    const result = analyzeSentiment(previewText, previewLanguage);
    setPreviewResult(result);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setPreviewText(transcript);
    setShowVoiceModal(false);
    // Auto-analyze after voice input
    setTimeout(() => {
      const result = analyzeSentiment(transcript, previewLanguage);
      setPreviewResult(result);
    }, 100);
  };

  const updateThreshold = (key: keyof typeof localConfig.thresholds, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: value,
      },
    }));
  };

  const updateTrigger = (key: keyof typeof localConfig.triggers, value: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      triggers: {
        ...prev.triggers,
        [key]: value,
      },
    }));
  };

  const updateMetricSelection = (key: keyof typeof localConfig.metricsSelection, value: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      metricsSelection: {
        ...prev.metricsSelection,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="thresholds" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Thresholds Tab */}
        <TabsContent value="thresholds" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Sentiment Thresholds</CardTitle>
              <CardDescription>Configure when sentiment is considered negative or escalation-worthy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Negative Threshold */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Negative Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={-1}
                    max={0}
                    step={0.05}
                    value={[localConfig.thresholds.negativeThreshold]}
                    onValueChange={(value) => updateThreshold('negativeThreshold', value[0])}
                    className="flex-1"
                  />
                  <span className="font-semibold w-16 text-right">
                    {localConfig.thresholds.negativeThreshold.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scores below this value are considered negative
                </p>
              </div>

              {/* Escalation Threshold */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Escalation Threshold</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={-1}
                    max={0}
                    step={0.05}
                    value={[localConfig.thresholds.escalationThreshold]}
                    onValueChange={(value) => updateThreshold('escalationThreshold', value[0])}
                    className="flex-1"
                  />
                  <span className="font-semibold w-16 text-right">
                    {localConfig.thresholds.escalationThreshold.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scores below this trigger escalation alert
                </p>
              </div>

              {/* Consecutive Negative Count */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Consecutive Negative Turns</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[localConfig.thresholds.consecutiveNegativeCount]}
                    onValueChange={(value) => updateThreshold('consecutiveNegativeCount', value[0])}
                    className="flex-1"
                  />
                  <span className="font-semibold w-16 text-right">
                    {localConfig.thresholds.consecutiveNegativeCount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of negative turns before escalation
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Trigger Configuration</CardTitle>
              <CardDescription>Enable or disable specific escalation triggers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Escalation Trigger */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable Escalation Trigger</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trigger escalation alerts when thresholds are met
                  </p>
                </div>
                <Switch
                  checked={localConfig.triggers.enableEscalation}
                  onCheckedChange={(value) => updateTrigger('enableEscalation', value)}
                />
              </div>

              {/* Negative Streak Trigger */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable Negative Streak Detection</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Detect consecutive negative turns
                  </p>
                </div>
                <Switch
                  checked={localConfig.triggers.enableNegativeStreak}
                  onCheckedChange={(value) => updateTrigger('enableNegativeStreak', value)}
                />
              </div>

              {/* Volatility Alert */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable Volatility Alert</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Alert on rapid sentiment changes
                  </p>
                </div>
                <Switch
                  checked={localConfig.triggers.enableVolatilityAlert}
                  onCheckedChange={(value) => updateTrigger('enableVolatilityAlert', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Metrics Selection</CardTitle>
              <CardDescription>Choose which metrics to display in the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Average Sentiment */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Average Sentiment</Label>
                <Switch
                  checked={localConfig.metricsSelection.avgSentiment}
                  onCheckedChange={(value) => updateMetricSelection('avgSentiment', value)}
                />
              </div>

              {/* Negative Rate */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Negative Rate</Label>
                <Switch
                  checked={localConfig.metricsSelection.negativeRate}
                  onCheckedChange={(value) => updateMetricSelection('negativeRate', value)}
                />
              </div>

              {/* Volatility */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Volatility</Label>
                <Switch
                  checked={localConfig.metricsSelection.volatility}
                  onCheckedChange={(value) => updateMetricSelection('volatility', value)}
                />
              </div>

              {/* Escalation Count */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Escalation Count</Label>
                <Switch
                  checked={localConfig.metricsSelection.escalationCount}
                  onCheckedChange={(value) => updateMetricSelection('escalationCount', value)}
                />
              </div>

              {/* Latency */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Latency Metrics</Label>
                <Switch
                  checked={localConfig.metricsSelection.latency}
                  onCheckedChange={(value) => updateMetricSelection('latency', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Live Sentiment Preview</CardTitle>
              <CardDescription>Test sentiment analysis with sample text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <div className="flex gap-2">
                  <Button
                    variant={previewLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => setPreviewLanguage('en')}
                    className="flex-1"
                  >
                    English
                  </Button>
                  <Button
                    variant={previewLanguage === 'vi' ? 'default' : 'outline'}
                    onClick={() => setPreviewLanguage('vi')}
                    className="flex-1"
                  >
                    Vietnamese
                  </Button>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sample Text</Label>
                <Input
                  placeholder={previewLanguage === 'en' ? 'Enter English text...' : 'Nhập văn bản tiếng Việt...'}
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="min-h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handlePreview} className="flex-1 bg-primary hover:bg-primary/90">
                  Analyze Sentiment
                </Button>
                <Button
                  onClick={() => setShowVoiceModal(true)}
                  variant="outline"
                  className="flex-1"
                  title="Use voice input"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Input
                </Button>
              </div>

              {/* Results */}
              {previewResult && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sentiment Label</span>
                    <Badge
                      style={{
                        backgroundColor: getSentimentColor(previewResult.score),
                        color: 'white',
                      }}
                    >
                      {previewResult.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className="font-semibold">{previewResult.score.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <span className="font-semibold">{(previewResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Voice Modal */}
      <VoiceModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTranscript={handleVoiceTranscript}
        language={previewLanguage}
        onLanguageChange={setPreviewLanguage}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
}
