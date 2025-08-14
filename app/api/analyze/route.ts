import { API, PDF_PROCESSING } from "@/lib/constants";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimiter } from "@/lib/ratelimiters";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        await rateLimiter(request);
        const body = await request.json().catch(()=> ({}));
        const {text} = body;

        if(!text || typeof text !== 'string'){
            throw new ApiError(400, "Invalid Input:Text is required");
        }

        if(text.length === 0){
            throw new ApiError(400, "Invalid Input:Text is empty");
        }

        const processedText = text.substring(0, PDF_PROCESSING.MAX_TEXT_LENGTH);
        const response = await fetch(`${API.GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents:[{
                    parts: [{
                        text: `Please analyze this document and provide an elegent, narrative summary with the followong format:
                            # Document Overview
                            Write a concise 3-4 sentence overview that captures the essence of the document.
                            Focus on the main subject, purpose and scope of the document.

                            # Main Insights
                            Write a bulleted list of the key insights and findings from the document.
                            Highlight any important concepts, arguments or conclusions.

                            # Critical Analysis
                            Write a concise 2-3 sentence analysis that evaluates the document's strengths and weaknesses.
                            Consider the document's tone, language and structure.

                            # Conclusion
                            Write a concise 1-2 sentence summary that restates the main points and highlights the document's significance.
                            Summarize the key takeaways and implications of the document.

                            Document content:
                            ${processedText}
                        `
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        if(!response.ok){
            const errorData = await response.json().catch(()=> ({}));
            throw new ApiError(
                response.status,
                errorData.error?.message || `Failed to analyze document: ${response.statusText}`,
                errorData
            )
        }

        const data = await response.json()
        if(!data?.candidates?.[0]?.content?.parts?.[0]?.text){
            throw new ApiError(500, "Failed to analyze document: Invalid response format");
        };
        return NextResponse.json({summary: data.candidates[0].content.parts[0].text})
    } catch (error) {
        return handleApiError(error)
    }
}