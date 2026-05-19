"use client"

import { useState, useRef, useCallback } from "react"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { uploadProductImage } from "@/lib/upload-actions"

interface ImageUploaderProps {
    value: string | null
    onChange: (url: string | null) => void
    disabled?: boolean
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            alert("Apenas imagens são permitidas")
            return
        }

        if (file.size > 4 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 4MB")
            return
        }

        setIsUploading(true)
        setPreview(URL.createObjectURL(file))

        const formData = new FormData()
        formData.set("file", file)

        const result = await uploadProductImage(formData)

        if ("url" in result) {
            onChange(result.url)
        } else {
            alert(result.error)
            setPreview(null)
        }

        setIsUploading(false)
        if (inputRef.current) inputRef.current.value = ""
    }, [onChange])

    const handleRemove = useCallback(() => {
        onChange(null)
        setPreview(null)
    }, [onChange])

    const displayUrl = preview || value

    return (
        <div className="space-y-2">
            {displayUrl ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-muted border shadow-sm group/image">
                    <Image
                        src={displayUrl}
                        alt="Product image"
                        fill
                        sizes="(max-width: 640px) 100vw, 400px"
                        className="object-cover"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-foreground opacity-0 group-hover/image:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    className={cn(
                        "w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 transition-colors relative group",
                        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/50"
                    )}
                    onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={disabled}
                    />
                    {isUploading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Enviando...</span>
                        </>
                    ) : (
                        <>
                            <div className="p-2 rounded-full bg-muted-foreground/10 group-hover:bg-muted-foreground/20 transition-colors">
                                <ImagePlus className="h-5 w-5 text-muted-foreground/60" />
                            </div>
                            <span className="text-sm font-medium">Adicionar Imagem</span>
                            <span className="text-xs text-muted-foreground">
                                PNG, JPG ou WEBP até 4MB
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
