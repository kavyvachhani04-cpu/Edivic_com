import React from 'react';
import { Shield, FileText } from 'lucide-react';

interface LegalPageProps {
    type: 'privacy' | 'terms';
}

const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-[#0f172a] pt-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
            <div className="mx-auto h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                {isPrivacy ? (
                    <Shield className="h-8 w-8 text-green-400" />
                ) : (
                    <FileText className="h-8 w-8 text-blue-400" />
                )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}
            </h1>
        </div>

        <div className="glass p-8 md:p-10 rounded-3xl border border-white/10 text-slate-300 leading-relaxed space-y-6">
            {isPrivacy ? (
                <>
                    <p className="text-lg">
                        EDIVIC respects user privacy and does not share personal data with third parties without consent. All data is securely stored using modern cloud infrastructure.
                    </p>
                    <p>
                        We collect only the information necessary to provide our marketplace services, such as your name, email, and project details. 
                    </p>
                    <p>
                        Your data is encrypted in transit and at rest. We are committed to transparency in how we handle your personal information.
                    </p>
                </>
            ) : (
                <>
                    <p className="text-lg">
                        By using EDIVIC, users agree to follow platform rules and use the service responsibly.
                    </p>
                    <p>
                         EDIVIC provides a platform for clients and editors to connect, but we are not responsible for disputes regarding creative direction or off-platform agreements between clients and editors.
                    </p>
                    <p>
                        Users must not post illegal, offensive, or copyrighted content that they do not have permission to use. We reserve the right to suspend accounts that violate these terms.
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;