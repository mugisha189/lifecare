// src/components/DownloadAppSection.tsx
import qrCodeImage from '../assets/QR_code_for_mobile_English_Wikipedia.svg 1.png';
import iphoneMockup from '../assets/iPhone-mockup.png';
import iphonelogo from '../assets/Apple Logo.png';
import androidlogo from '../assets/Subtract.png';
import { Download } from 'lucide-react';

export default function DownloadAppSection() {
  return (
    <section className='bg-blue-900 py-6 px-4 sm:px-6 md:px-12 rounded-2xl overflow-visible'>
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8'>
        {/* LEFT: Text & Buttons */}
        <div className='md:w-1/2 text-white space-y-3'>
          <h2 className='text-xl sm:text-2xl md:text-3xl font-bold'>Download App</h2>
          <p className='text-xs sm:text-sm opacity-90'>
            Download mobile app to scan devices, track vehicles, and manage services on the go. Stay connected anywhere,
            anytime!
          </p>

          <div className='flex flex-col sm:flex-row sm:items-start gap-3 mt-2'>
            <div className='flex flex-col gap-2 w-full sm:w-auto'>
              <button className='flex items-center gap-2 text-white border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-xs sm:text-sm whitespace-nowrap'>
                <img src={iphonelogo} alt='Apple Logo' className='w-4 h-4 sm:w-5 sm:h-5' />
                <div className='text-left'>
                  <div className='text-[10px] sm:text-xs opacity-70'>Download on</div>
                  <div className='font-semibold text-xs sm:text-sm'>iPhone/iPad</div>
                </div>
                <Download className='w-3 h-3 sm:w-4 sm:h-4 ml-auto' />
              </button>

              <button className='flex items-center gap-2 text-white border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-xs sm:text-sm whitespace-nowrap'>
                <img src={androidlogo} alt='Android Logo' className='w-4 h-4 sm:w-5 sm:h-5' />
                <div className='text-left'>
                  <div className='text-[10px] sm:text-xs opacity-70'>Download on</div>
                  <div className='font-semibold text-xs sm:text-sm'>Android/Google</div>
                </div>
                <Download className='w-3 h-3 sm:w-4 sm:h-4 ml-auto' />
              </button>
            </div>

            <div className='flex items-center justify-center border border-white/30 p-2.5 rounded-lg'>
              <img src={qrCodeImage} alt='QR Code' className='w-16 h-16 sm:w-20 sm:h-20' />
            </div>
          </div>
        </div>

        {/* RIGHT: iPhone Mockup - Adjust the translate-x values below */}
        <div className='md:w-1/2 flex justify-center md:justify-end md:translate-x-6 lg:translate-x-8'>
          <div className='relative w-[180px] sm:w-[200px] md:w-[230px] lg:w-[260px]'>
            <img src={iphoneMockup} alt='iPhone Mockup' className='relative z-10 w-full h-auto drop-shadow-xl' />
          </div>
        </div>
      </div>
    </section>
  );
}
