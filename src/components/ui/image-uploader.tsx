"use client"

import { useState, useCallback } from "react"
import { UploadButton } from "@/lib/uploadthing"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploaderProps {
    value: string | null
    onChange: (url: string | null) => void
    disabled?: boolean
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)

    const handleUploadComplete = useCallback((res: { url: string }[]) => {
        if (res && res[0]) {
            onChange(res[0].url)
        }
        setIsUploading(false)
    }, [onChange])

    const handleUploadError = useCallback((error: Error) => {
        console.error("Upload error:", error)
        setIsUploading(false)
    }, [])

    const handleRemove = useCallback(() => {
        onChange(null)
    }, [onChange])

    return (
        <div className="space-y-2">
            {value ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted border">
                    <Image 
                        src={value} 
                        alt="Product image" 
                        fill 
                        className="object-cover"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            ) : (
                <div className={cn(
                    "w-full h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
                    disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/50"
                )}>
                    <UploadButton
                        endpoint="productImage"
                        onUploadBegin={() => setIsUploading(true)}
                        onClientUploadComplete={handleUploadComplete}
                        onUploadError={handleUploadError}
                        content={{
                            button({ isUploading: uploading }) {
                                return (
                                    <div className="flex items-center gap-2">
                                        {uploading || isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Enviando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ImagePlus className="h-4 w-4" />
                                                <span>Adicionar Imagem</span>
                                            </>
                                        )}
                                    </div>
                                )
                            }
                        }}
                        appearance={{
                            container: {
                                width: "100%",
                                height: "100%",
                            },
                            button: {
                                width: "100%",
                                height: "100%",
                                background: "transparent",
                                border: "none",
                            },
                            allowedContent: {
                                display: "none",
                            }
                        }}
                        disabled={disabled}
                    />
                    <span className="text-xs text-muted-foreground">
                        ou arraste uma imagem
                    </span>
                </div>
            )}
        </div>
    )
}