import { NextResponse } from "next/server";


export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: any
    ){
        super(message);
    }
}

export const handleApiError = (error: unknown): NextResponse => {
    console.error("Api Error:",error);
    if(error instanceof ApiError){
        return NextResponse.json({error: error.message, details: error.details})
    }

    if(error instanceof Error){
        return NextResponse.json({error: error.message, status: 500})
    }

    return NextResponse.json({error: "Unknown error occured", status: 500})
}