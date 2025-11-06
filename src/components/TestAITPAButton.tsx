import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { testAITPAEngine } from "@/utils/testAITPAEngine";
import { useState } from "react";

export const TestAITPAButton = () => {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      await testAITPAEngine();
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button 
      onClick={handleTest}
      disabled={testing}
      className="gap-2"
    >
      <Shield className="h-4 w-4" />
      {testing ? 'Testing AITPA...' : 'Test AITPA Engine'}
    </Button>
  );
};
