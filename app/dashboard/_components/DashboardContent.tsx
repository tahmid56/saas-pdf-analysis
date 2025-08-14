"use client";
import { extractTextFromPDF } from '@/lib/pdfUtils';
import { useUser } from '@clerk/nextjs';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'

const DashboardContent = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedFile, setSelectedFile] = useState<File | null>();
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
    useEffect(() => {
        const isPaymentSuccess = searchParams?.get('payment') === 'success';
        if (isPaymentSuccess) {
            setShowPaymentSuccess(true);
            router.replace('/dashboard');
            const timer = setTimeout(() => {
                setShowPaymentSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const file = e.target.files?.[0];
        if (!file) {
            setError('Please select a file');
            return;
        }
        setSelectedFile(file);
    }

    const handleAnalyze = useCallback(async () => {
        if(!selectedFile){
            setError("Please select a file before analyzing");
            return;
        };
        setIsLoading(true);
        setError('');
        setSummary('');
        try {
            const text = await extractTextFromPDF(selectedFile);
            const response = await fetch('/api/analyze', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({text: text.substring(0.10000)})
            })
            if(!response.ok){
                const errorData = await response.json().catch(() => {});
                throw new Error(errorData.error || `HTTP errors! status: ${response.status}`)
            }

            const data = await response.json();
            setSummary(data.summary || "No summary was generated");
            
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze PDF");
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile])

    const formatSummaryContent = (text: string) => {
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        return paragraphs.map((paragraph, index) => {
            if(paragraph.startsWith("# ")){
                return <h2 key={index} className='text-2xl font-bold mt-6 mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
                    {paragraph.replace(/^#/, '')}
                </h2>
            }

            if(paragraph.startsWith('## ')){
                return (
                    <h3 key={index} className='text-xl font-semibold mt-6 mb-3 text-purple-300 border-b border-purple-500/20 pb-2'>
                        {paragraph.replace(/^##/, '')}
                    </h3>
                )
            }
            return(
                <p key={index} className='mb-4 text-gray-300 leading-relaxed hover:text-white transition-colors first-letter:text-lg first-letter:font-medium'>
                    {paragraph}
                </p>
            )
        })
    }
    return (
        <div className='mt-24 space-y-10 max-w-4xl mx-auto'>
            {showPaymentSuccess && (
                <div className='bg-green-500/10 max-w-xl mx-auto border border-green-500/20 rounded-xl p-4 text-green-400'>
                    <div className='flex items-center justify-center'>
                        <CheckCircle className='h-5 w-5 mr-2' />
                        <p>Payment successfull! Your subscription is now active!</p>
                    </div>
                </div>
            )}
            <div className='p-10 space-y-6 rounded-2xl border border-purpole-300/10 bg-black/30 shadow-[0_4px_20px_-10px] shadow-purple-200/30'>
                {/* File input for PDF selection */}
                <div className='relative'>
                    <div className='my-2 ml-2 flex items-center text-xs text-gray-500'>
                        <FileText className='h-3.5 w-3.5 mr-1.5' />
                        <span>Supported format: PDF</span>
                    </div>
                    <div className='border border-gray-700 rounded-xl p-1 bg-black hover:border-purple-200/20 transition-colors'>
                        <input
                            type='file'
                            accept='.pdf'
                            onChange={handleFileChange}
                            className='block w-full text-gray-300 file:mr-4 file:py-3 file:px-6
                                file:rounded-lg file:border-0 file:text-sm file:font-medium
                                file:bg-purple-200/20 file:text-purple-200 hover:file:bg-purple-200/20 transition-all
                                focus:outline-none cursor-pointer'/>
                    </div>

                </div>
                <button disabled={!selectedFile || isLoading}
                    onClick={handleAnalyze}
                    className='group relative inline-flex items-center justify-center w-full gap-2 rounded-xl bg-black px-4 py-4
                        text-white transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed'>
                    <span className='absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF1E56] via-[#FF00FF] to-[#00FFFF]
                                opacity-70 blue-sm transition-all group-hover:opacity-100 disabled:opacity-40'/>
                    <span className='absolute inset-0.5 rounded-xl bg-black/50' />
                    <span className='relative font-medium'>
                        {isLoading ? 'Processing...' : 'Analyze Document'}
                    </span>
                </button>
            </div>
            {/* Error Message */}
            {error && (
                <div className='bg-red-500/10 max-w-xl mx-auto border border-red-500/20 rounded-xl p-4 text-red-400'>
                    <div className='flex items-center'>
                        <AlertCircle className='h-5 w-5 mr-2 mt-0.5' />
                        <div>
                            <p className='font-medium mb-1'>Error analyzing document</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Summary results */}
            {summary && (
                <div className='bg-black/20 shadow-[0_4px_20px_-10px] shadow-purple-200/30 rounded-2xl p-8 border border-[#2A2A35]'>
                    <div className='flex items-center mb-6'>
                        <div className='mr-3 p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20'>
                            <FileText className='h-6 w-6 text-purple-400' />
                        </div>
                    </div>
                    <div className='max-w-none px-6 py-5 rounded-xl bg-[#0f0f13] border border-[#2A2A35]'>
                        <pre className='whitespace-pre-wrap'>{formatSummaryContent(summary)}</pre>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DashboardContent