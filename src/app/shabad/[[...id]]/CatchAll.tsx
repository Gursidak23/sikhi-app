'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ShabadPageClient from './ShabadPageClient';

export default function ShabadCatchAll() {
  return <ShabadPageClient />;
}
