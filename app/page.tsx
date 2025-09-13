'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import MainPromotion from '@/components/MainPromotion'
import Testimonials from '@/components/Testimonials'
import VocabService from '@/components/VocabService'
import ContextService from '@/components/ContextService'

export default function Home() {
  return (
    <main>
      <Header />
      <MainPromotion />
      <Testimonials />
      <VocabService />
      <ContextService />
    </main>
  )
}
