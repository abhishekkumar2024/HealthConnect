import React, { useState } from 'react';
import { useDarkMode } from '../contextAPI/contextApi.js'; // Assuming the provider is in the same directory

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('gettingStarted');
  const { themeStyles } = useDarkMode();

  const sections = {
    gettingStarted: (
      <div>
        <h2 className={`text-xl font-bold ${themeStyles.text}`}>Getting Started</h2>
        <ul className="list-disc ml-5 mt-2">
          <li><strong>Accessing the AI System:</strong> Log in using your credentials and navigate to the "AI Tools" section on the dashboard.</li>
          <li><strong>Basic Commands:</strong> Enter your query in the provided text box and hit "Submit." Use the microphone icon for voice input if supported.</li>
          <li><strong>Supported Features:</strong> Text Analysis, Language Translation, Image Recognition, Predictive Analytics.</li>
        </ul>
      </div>
    ),
    keyFeatures: (
      <div>
        <h2 className={`text-xl font-bold ${themeStyles.text}`}>Key Features</h2>
        <ul className="list-disc ml-5 mt-2">
          <li><strong>Natural Language Understanding (NLU):</strong> Interpret and respond to user queries in a conversational manner, supporting multiple languages.</li>
          <li><strong>Customization:</strong> Fine-tune the AI model using the "Preferences" section and upload custom datasets for personalized results.</li>
          <li><strong>Integration:</strong> Integrates with external APIs and third-party platforms like Slack, Zoom, and more.</li>
          <li><strong>Real-Time Assistance:</strong> Offers immediate solutions to simple and complex problems with step-by-step guidance.</li>
        </ul>
      </div>
    ),
    troubleshooting: (
      <div>
        <h2 className={`text-xl font-bold ${themeStyles.text}`}>Troubleshooting Common Issues</h2>
        <ul className="list-disc ml-5 mt-2">
          <li><strong>System Not Responding:</strong> Ensure you have a stable internet connection and refresh the browser or restart the application.</li>
          <li><strong>Incorrect Outputs:</strong> Check the input for errors or ambiguities and use the "Feedback" button to report the issue.</li>
          <li><strong>Integration Problems:</strong> Verify API keys and configuration settings or contact support for advanced help.</li>
        </ul>
      </div>
    ),
    faqs: (
      <div>
        <h2 className={`text-xl font-bold ${themeStyles.text}`}>FAQs</h2>
        <ul className="list-disc ml-5 mt-2">
          <li><strong>What types of queries can I ask?</strong> You can ask anything from basic factual questions to complex problem-solving queries.</li>
          <li><strong>Can I train the AI on my own data?</strong> Yes, upload datasets under the "Customization" section.</li>
          <li><strong>Is my data secure?</strong> Absolutely. We adhere to strict privacy policies and use state-of-the-art encryption to protect your data.</li>
        </ul>
      </div>
    ),
  };

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text} p-5`}>
      <header className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">AI Help Page</h1>
      </header>
      <nav className={`flex space-x-4 py-2 px-4 rounded ${themeStyles.navBg}`}>
        {Object.keys(sections).map((key) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`py-2 px-4 rounded ${activeSection === key ? themeStyles.accentBg : ''} hover:${themeStyles.cardHoverBg}`}
          >
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </button>
        ))}
      </nav>
      <main className={`mt-5 p-5 rounded ${themeStyles.cardBg} shadow-lg`}>
        {sections[activeSection]}
      </main>
    </div>
  );
};

export { HelpPage };

