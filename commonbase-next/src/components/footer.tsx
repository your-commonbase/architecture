export function Footer() {
  return (
    <footer className="bg-white border-t-4 border-black mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Fork me on GitHub */}
            <a 
              href="https://github.com/your-commonbase/commonbase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black font-semibold hover:underline"
            >
              Fork me on GitHub →
            </a>

          {/* Your Commonbase Homepage */}
            <a 
              href="https://yourcommonbase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black font-semibold hover:underline"
            >
              Want syncing across mobile and desktop, the newest feature set, and more? →
            </a>
          {/* Consulting */}
            <a 
              href="https://docs.google.com/document/d/1zGWZlsUjeCMq_tmbTCcmXvqzcFxKbQNce6r_9o1k5Nw/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black font-semibold hover:underline"
            >
              Do you represent a business or organization that is frustrated with their storing, searching, synthesizing and sharing of information? →
            </a>

          {/* Copyright */}
            <div className="text-black font-semibold text-sm">
              <div className="mb-1">© 2025 Your Commonbase, LLC.</div>
              <div>Released under the MIT license.</div>
            </div>
        </div>
      </div>
    </footer>
  );
}