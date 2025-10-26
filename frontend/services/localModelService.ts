import { PolicyDocument, GeminiResponse } from '../types';

/**
 * Simulates a response from a local AI model.
 * This function is designed to be a drop-in replacement for the remote service.
 * It provides canned responses to demonstrate the application's architecture.
 */
export const getLocalChatResponse = async (
  userMessage: string,
  policies: PolicyDocument[],
): Promise<GeminiResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const lowerCaseMessage = userMessage.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|greetings)\s*!*$/i.test(lowerCaseMessage.trim())) {
    return {
      text: "Hello! I am the Local Policy Assistant. How can I assist you?",
      citationSource: null,
    };
  }

  const isPolicyQuery = /policy|leave|security|hr|it|annual|eligibility/i.test(lowerCaseMessage);

  if (isPolicyQuery && policies.length === 0) {
    return {
      text: "I cannot answer policy questions as no documents are loaded. Please upload a policy document.",
      citationSource: null,
    };
  }

  // Canned response for a specific policy
  if (lowerCaseMessage.includes('leave')) {
    const leavePolicy = policies.find(p => p.type === 'HR' || p.name.toLowerCase().includes('leave'));
    if (leavePolicy) {
      return {
        text: `Based on the "${leavePolicy.name}" document, employees are entitled to 20 days of paid leave per year.`,
        citationSource: leavePolicy,
      };
    }
  }
  
  // Canned response for IT security
  if (lowerCaseMessage.includes('password') || lowerCaseMessage.includes('security')) {
     const securityPolicy = policies.find(p => p.type === 'IT Security');
     if (securityPolicy) {
        return {
            text: `According to the "${securityPolicy.name}", passwords must be at least 12 characters long and include a mix of uppercase, lowercase, numbers, and symbols.`,
            citationSource: securityPolicy,
        };
     }
  }

  // Fallback response if no specific match is found
  if(isPolicyQuery) {
      return {
          text: "I have reviewed the available documents but could not find specific information on that topic. For further assistance, please contact your HR representative (HRBP).",
          citationSource: null,
      };
  }

  // General non-policy response
  return {
    text: "I am a local AI assistant designed to answer questions about company policies. Please ask me something related to the uploaded documents.",
    citationSource: null,
  };
};
