import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/" className="text-gray-600 hover:text-gray-900 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <p className="mb-6">
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Nutro AI mobile application and website (the "Service") operated by Nutro AI ("us", "we", or "our").
            </p>
            
            <p className="mb-6">
              Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.
            </p>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Interpretation and Definitions</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">Interpretation</h3>
              <p className="mb-4">
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Definitions</h3>
              <p className="mb-4">For the purposes of these Terms of Service:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
                <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Nutro AI.</li>
                <li><strong>Content</strong> refers to content such as text, images, or other information that can be posted, uploaded, linked to or otherwise made available by You, regardless of the form of that content.</li>
                <li><strong>Country</strong> refers to: United States</li>
                <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                <li><strong>Service</strong> refers to the Website and Mobile Application.</li>
                <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</li>
                <li><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</li>
                <li><strong>Website</strong> refers to Nutro AI, accessible from nutro.ai (or applicable domain)</li>
                <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Acknowledgment</h2>
              <p className="mb-4">
                These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
              </p>
              <p className="mb-4">
                Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
              </p>
              <p className="mb-4">
                By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
              </p>
              <p className="mb-4">
                You represent that you are over the age of 13. The Company does not permit those under 13 to use the Service.
              </p>
              <p className="mb-4">
                Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our Privacy Policy carefully before using Our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">User Accounts</h2>
              <p className="mb-4">
                When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.
              </p>
              <p className="mb-4">
                You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password, whether Your password is with Our Service or a Third-Party Social Media Service.
              </p>
              <p className="mb-4">
                You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming aware of any breach of security or unauthorized use of Your account.
              </p>
              <p className="mb-4">
                You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than You without appropriate authorization, or a name that is otherwise offensive, vulgar, or obscene.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Content</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">Your Right to Post Content</h3>
              <p className="mb-4">
                Our Service allows You to post Content. You are responsible for the Content that You post to the Service, including its legality, reliability, and appropriateness.
              </p>
              <p className="mb-4">
                By posting Content to the Service, You grant Us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of Your rights to any Content You submit, post or display on or through the Service and You are responsible for protecting those rights. You agree that this license includes the right for Us to make Your Content available to other users of the Service, who may also use Your Content subject to these Terms.
              </p>
              <p className="mb-4">
                You represent and warrant that: (i) the Content is Yours (You own it) or You have the right to use it and grant Us the rights and license as provided in these Terms, and (ii) the posting of Your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Content Restrictions</h3>
              <p className="mb-4">The Company is not responsible for the content of the Service's users. You expressly understand and agree that You are solely responsible for the Content and for all activity that occurs under your account, whether done so by You or any third person using Your account.</p>
              <p className="mb-4">You may not transmit any Content that is unlawful, offensive, upsetting, intended to disgust, threatening, libelous, defamatory, obscene or otherwise objectionable. Examples of such objectionable Content include, but are not limited to, the following:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Unlawful or promoting unlawful activity.</li>
                <li>Defamatory, discriminatory, or mean-spirited content, including references or commentary about religion, race, sexual orientation, gender, national/ethnic origin, or other targeted groups.</li>
                <li>Spam, machine – or randomly – generated, constituting unauthorized or unsolicited advertising, chain letters, any other form of unauthorized solicitation, or any form of lottery or gambling.</li>
                <li>Containing or installing any viruses, worms, malware, trojan horses, or other content that is designed or intended to disrupt, damage, or limit the functioning of any software, hardware or telecommunications equipment or to damage or obtain unauthorized access to any data or other information of a third person.</li>
                <li>Infringing on any proprietary rights of any party, including patent, trademark, trade secret, copyright, right of publicity or other rights.</li>
                <li>Impersonating any person or entity including the Company and its employees or representatives.</li>
                <li>Violating the privacy of any third person.</li>
                <li>False information and features.</li>
              </ul>
              <p className="mb-4">The Company reserves the right, but not the obligation, to, in its sole discretion, determine whether or not any Content is appropriate and complies with this Terms, refuse or remove this Content. The Company further reserves the right to make formatting and edits and change the manner of any Content. The Company can also limit or revoke the use of the Service if You post such objectionable Content. As the Company cannot control all content posted by users and/or third parties on the Service, you agree to use the Service at your own risk.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Subscriptions and Payments</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">Subscription Period</h3>
              <p className="mb-4">
                Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
              </p>
              <p className="mb-4">
                At the end of each Billing Cycle, Your Subscription will automatically renew under the exact same conditions unless You cancel it or the Company cancels it. You may cancel Your Subscription renewal either through Your online account management page or by contacting the Company customer support team.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Free Trial</h3>
              <p className="mb-4">
                The Company may, at its sole discretion, offer a Subscription with a free trial for a limited period of time ("Free Trial").
              </p>
              <p className="mb-4">
                You may be required to enter Your billing information in order to sign up for the Free Trial.
              </p>
              <p className="mb-4">
                If You do not cancel Your Subscription before the Free Trial period expires, You will be automatically charged the applicable Subscription fees for the type of Subscription You have selected.
              </p>
              <p className="mb-4">
                At any time and without notice, the Company reserves the right to (i) modify the terms and conditions of the Free Trial offer, or (ii) cancel such Free Trial offer.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Fee Changes</h3>
              <p className="mb-4">
                The Company, in its sole discretion and at any time, may modify the Subscription fees. Any Subscription fee change will become effective at the end of the then-current Billing Cycle.
              </p>
              <p className="mb-4">
                The Company will provide You with reasonable prior notice of any change in Subscription fees to give You an opportunity to terminate Your Subscription before such change becomes effective.
              </p>
              <p className="mb-4">
                Your continued use of the Service after the Subscription fee change comes into effect constitutes Your agreement to pay the modified Subscription fee amount.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Refunds</h3>
              <p className="mb-4">
                Except when required by law, paid Subscription fees are non-refundable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Company and its licensors.
              </p>
              <p className="mb-4">
                The Service is protected by copyright, trademark, and other laws of both the Country and foreign countries.
              </p>
              <p className="mb-4">
                Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of the Company.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Your Feedback to Us</h2>
              <p className="mb-4">
                You assign all rights, title and interest in any Feedback You provide the Company. If for any reason such assignment is ineffective, You agree to grant the Company a non-exclusive, perpetual, irrevocable, royalty free, worldwide right and license to use, reproduce, disclose, sub-license, distribute, modify and exploit such Feedback without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Disclaimer</h2>
              <p className="mb-4">
                The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Excludes all representations, warranties, conditions and terms relating to our Service and the use of this Service (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill).</li>
                <li>Excludes all liability for damages arising out of or in connection with your use of this Service. This includes, without limitation, direct loss, loss of business or profits (whether or not the loss of such profits was foreseeable, arose in the normal course of things or you have advised this Company of the possibility of such potential loss), damage caused to your computer, computer software, systems and programs and the data thereon or any other direct or indirect, consequential and incidental damages.</li>
              </ul>
              <p className="mb-4">
                <strong>Medical Disclaimer:</strong> The nutrition information, food analysis, and health-related content provided by the Service are for informational purposes only and are not intended as medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this Service.
              </p>
              <p className="mb-4">
                The food analysis and nutrition data provided by the Service are estimates based on AI analysis and may not be 100% accurate. You should not rely solely on this information for making dietary decisions, especially if you have specific dietary requirements, allergies, or medical conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Limitation of Liability</h2>
              <p className="mb-4">
                Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
              </p>
              <p className="mb-4">
                To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of this Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.
              </p>
              <p className="mb-4">
                Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">"AS IS" and "AS AVAILABLE" Disclaimer</h2>
              <p className="mb-4">
                The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice.
              </p>
              <p className="mb-4">
                Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Governing Law</h2>
              <p className="mb-4">
                The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Disputes Resolution</h2>
              <p className="mb-4">
                If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">For European Union (EU) Users</h2>
              <p className="mb-4">
                If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which you are resident in.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">United States Legal Compliance</h2>
              <p className="mb-4">
                You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Severability and Waiver</h2>
              
              <h3 className="text-2xl font-semibold mb-3 mt-6">Severability</h3>
              <p className="mb-4">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
              </p>

              <h3 className="text-2xl font-semibold mb-3 mt-6">Waiver</h3>
              <p className="mb-4">
                Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not effect a party's ability to exercise such right or require such performance at any time thereafter nor shall be the waiver of a breach constitute a waiver of any subsequent breach.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Translation Interpretation</h2>
              <p className="mb-4">
                These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Changes to These Terms of Service</h2>
              <p className="mb-4">
                We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
              </p>
              <p className="mb-4">
                By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, You can contact us:
              </p>
              <p className="mb-4">
                <strong>By email:</strong> support@nutro.ai
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

