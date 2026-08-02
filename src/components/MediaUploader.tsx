import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader2, File, Image, Video, Music, Link as LinkIcon, X } from 'lucide-react';
import { dataService } from '../services/dataService';

interface MediaUploaderProps {
  bucket?: 'photos' | 'videos' | 'music' | 'notes-attachments';
  accept?: string;
  onUploadSuccess?: (url: string) => void;
  onChange?: (url: string) => void;
  value?: string;
  label?: string;
  type?: 'image' | 'video' | 'audio' | 'file';
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  bucket = 'photos',
  accept = 'image/*',
  onUploadSuccess,
  onChange,
  value = '',
  label = 'Unggah Foto / Media',
  type = 'image'
}) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const notifyChange = (url: string) => {
    if (onUploadSuccess) onUploadSuccess(url);
    if (onChange) onChange(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUploading(true);
    setProgress(10);

    try {
      const targetBucket = (['photos', 'videos', 'music', 'notes-attachments'].includes(bucket)
        ? bucket
        : 'photos') as 'photos' | 'videos' | 'music' | 'notes-attachments';

      const publicUrl = await dataService.uploadFile(file, targetBucket, (pct) => {
        setProgress(pct);
      });

      setSuccessMsg(`Berhasil mengunggah ${file.name}`);
      notifyChange(publicUrl);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setErrorMsg(err.message || 'Gagal mengunggah file. Silakan periksa format file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    notifyChange(e.target.value);
  };

  const handleClear = () => {
    notifyChange('');
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const getIcon = () => {
    if (type === 'image' || bucket === 'photos' || bucket === 'notes-attachments') return Image;
    if (type === 'video' || bucket === 'videos') return Video;
    if (type === 'audio' || bucket === 'music') return Music;
    return File;
  };

  const BucketIcon = getIcon();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">{label}</label>
        
        {/* Toggle Mode */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`px-2 py-1 rounded-md transition-all ${
              uploadMode === 'file' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            Unggah File
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-2 py-1 rounded-md transition-all ${
              uploadMode === 'url' ? 'bg-white text-rose-600 shadow-2xs font-bold' : 'text-slate-500'
            }`}
          >
            URL Gambar
          </button>
        </div>
      </div>

      {uploadMode === 'file' ? (
        <div className="relative border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 group">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <BucketIcon className="w-5 h-5" />
              </div>
            )}

            <div className="text-xs font-medium text-slate-700">
              {isUploading ? 'Mengunggah file...' : 'Klik atau seret foto ke sini untuk mengunggah'}
            </div>
            <p className="text-[10px] text-slate-400">
              Format: PNG, JPG, WEBP, GIF
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="url"
            placeholder="Tempel tautan URL gambar (https://...)"
            value={value}
            onChange={handleUrlInputChange}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-rose-200 focus:border-rose-400 text-xs outline-none bg-white"
          />
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-rose-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-rose-400 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preview Box */}
      {value && (
        <div className="relative mt-2 rounded-2xl overflow-hidden border border-rose-200 bg-white p-2.5 flex items-center justify-between space-x-3 shadow-2xs">
          <div className="flex items-center space-x-3 overflow-hidden">
            {type === 'image' || bucket === 'photos' || bucket === 'notes-attachments' ? (
              <img src={value} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-slate-100 shrink-0" referrerPolicy="no-referrer" />
            ) : type === 'video' || bucket === 'videos' ? (
              <video src={value} className="w-14 h-14 object-cover rounded-xl shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center shrink-0">
                <Music className="w-6 h-6" />
              </div>
            )}
            <div className="text-xs truncate">
              <p className="font-bold text-slate-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Foto Terpasang</span>
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-50">{value}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
            title="Hapus foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
