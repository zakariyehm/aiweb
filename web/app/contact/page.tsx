import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link href="/" className="text-gray-600 hover:text-gray-900 hover:underline mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Contact Us</h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6 text-lg">
              We'd love to hear from you! Get in touch with us using the information below or fill out the form.
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <strong className="text-gray-900">Email:</strong>
                  <p className="text-gray-600">support@nutro.app</p>
                </div>
                <div>
                  <strong className="text-gray-900">Phone:</strong>
                  <p className="text-gray-600">+252615794898</p>
                </div>
                <div>
                  <strong className="text-gray-900">Address:</strong>
                  <p className="text-gray-600">
                    123 Nutrition Street<br />
                    Health City, HC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your message here..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

