import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-50 to-white">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Ik Onkar Symbol */}
        <div className="mb-8">
          <span className="text-8xl font-gurmukhi text-neela-700 opacity-30">ੴ</span>
        </div>

        {/* 404 Message */}
        <h1 className="text-6xl font-bold text-neela-800 mb-4">404</h1>
        
        <h2 className="text-2xl font-gurmukhi text-amber-800 mb-2">
          ਪੰਨਾ ਨਹੀਂ ਮਿਲਿਆ
        </h2>
        
        <p className="text-lg text-neutral-600 mb-8">
          Page not found
        </p>

        <p className="text-sm text-neutral-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-neela-600 text-white rounded-lg font-medium hover:bg-neela-700 transition-colors"
          >
            Go Home
          </Link>
          
          <Link
            href="/gurbani"
            className="px-6 py-3 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 transition-colors font-gurmukhi"
          >
            📖 ਗੁਰਬਾਣੀ
          </Link>
          
          <Link
            href="/itihaas"
            className="px-6 py-3 bg-kesri-100 text-kesri-800 rounded-lg font-medium hover:bg-kesri-200 transition-colors font-gurmukhi"
          >
            📜 ਇਤਿਹਾਸ
          </Link>
        </div>

        {/* Mool Mantar - Inspirational */}
        <div className="mt-16 p-6 bg-neela-50 rounded-xl border border-neela-200">
          <p className="font-gurmukhi text-lg text-neela-800 leading-relaxed">
            ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ<br />
            ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥
          </p>
          <p className="text-xs text-neela-600 mt-3">
            Mool Mantar - Sri Guru Granth Sahib Ji
          </p>
        </div>
      </div>
    </div>
  );
}
