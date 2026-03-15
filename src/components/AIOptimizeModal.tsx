'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { optimizeImageWithAI, downloadImageAsDataURL } from '../utils/aiOptimize';

interface AIOptimizeModalProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
  onOptimized: (optimizedImageSrc: string) => void;
}

// LocalStorage Key
const STORAGE_KEYS = {
  API_KEY: 'perler-beads-api-key',
  MODEL_NAME: 'perler-beads-model-name'
};

// 默认配置
const DEFAULT_CONFIG = {
  MODEL_NAME: 'wanx-v1',  // 通义万相（支持 Base64）
  PROMPT: '图片修改为：chibi 画风，背景白底。pixel art style, 16-bit, retro game aesthetic, sharp focus, high contrast, clean lines, detailed pixel art, masterpiece, best quality'
};

export default function AIOptimizeModal({
  imageSrc,
  isOpen,
  onClose,
  onOptimized
}: AIOptimizeModalProps) {
  // API Key 和模型配置
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState(DEFAULT_CONFIG.MODEL_NAME);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // 优化状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // 从 LocalStorage 加载配置
  useEffect(() => {
    if (isOpen) {
      const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
      const savedModelName = localStorage.getItem(STORAGE_KEYS.MODEL_NAME);
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      if (savedModelName) {
        setModelName(savedModelName);
      }
    }
  }, [isOpen]);

  // 保存配置到 LocalStorage
  const saveConfig = useCallback(() => {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
    }
    if (modelName.trim()) {
      localStorage.setItem(STORAGE_KEYS.MODEL_NAME, modelName.trim());
    }
  }, [apiKey, modelName]);

  const handleOptimize = useCallback(async () => {
    if (!imageSrc) return;

    // 验证 API Key
    if (!apiKey.trim()) {
      setError('请输入阿里云百炼 API Key（格式：sk-开头）');
      return;
    }

    // 验证 API Key 格式
    if (!apiKey.trim().startsWith('sk-')) {
      setError('API Key 格式错误，应该以 "sk-" 开头');
      return;
    }

    // 保存配置
    saveConfig();

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setPreviewImage(null);

    try {
      const prompt = customPrompt.trim() || DEFAULT_CONFIG.PROMPT;

      const result = await optimizeImageWithAI(imageSrc, {
        customPrompt: prompt,
        apiKey: apiKey.trim(),
        modelName: modelName.trim(),
        onProgress: (p) => setProgress(p)
      });

      if (result.success && result.imageUrl) {
        // 下载优化后的图片
        const dataUrl = await downloadImageAsDataURL(result.imageUrl);
        setPreviewImage(dataUrl);
      } else {
        // 处理错误
        let errorMessage = result.error || '优化失败，请重试';
        
        if (errorMessage.includes('IMAGE_RISK') || errorMessage.includes('安全检测')) {
          errorMessage = '图片未能通过安全检测，请尝试使用其他图片。可能的原因：\n• 图片包含敏感内容\n• 图片格式不支持\n• 图片质量过低';
        } else if (errorMessage.includes('Invalid API Key') || errorMessage.includes('InvalidApiKey')) {
          errorMessage = 'API Key 无效，请检查：\n• API Key 是否正确（以 sk- 开头）\n• API Key 是否已过期\n• 账号是否开通了通义万相服务';
        } else if (errorMessage.includes('Quota')) {
          errorMessage = 'API 配额已用完，请检查阿里云账号余额或等待下月重置';
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : '发生未知错误';

      if (errorMessage.includes('IMAGE_RISK')) {
        errorMessage = '图片未能通过安全检测，请尝试使用其他图片。';
      } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        errorMessage = '网络连接失败，请检查：\n• 网络连接是否正常\n• API Key 是否正确\n• 阿里云服务是否可用';
      }

      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, customPrompt, apiKey, modelName, saveConfig]);

  const handleConfirm = useCallback(() => {
    if (previewImage) {
      onOptimized(previewImage);
      onClose();
    }
  }, [previewImage, onOptimized, onClose]);

  const handleReset = useCallback(() => {
    setPreviewImage(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleClearApiKey = useCallback(() => {
    setApiKey('');
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 图片优化（Qwen-Image 2.0）
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          {/* API Key 配置 */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              API 配置（首次使用需要，之后会自动保存）
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* API Key 输入 */}
              <div>
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  阿里云 API Key *
                </label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    disabled={isProcessing || !!previewImage}
                    className="flex-1 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-2 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title={showApiKey ? '隐藏' : '显示'}
                  >
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleClearApiKey}
                      className="px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="清除"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  <a href="https://bailian.console.aliyun.com/cn-beijing/?tab=api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800 dark:hover:text-blue-200">
                    获取 API Key →
                  </a>
                </p>
              </div>

              {/* 模型选择 */}
              <div>
                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  模型名称
                </label>
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  disabled={isProcessing || !!previewImage}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="wanx-v1">wanx-v1 通义万相（推荐，支持 Base64）</option>
                  <option value="wanx2.1-pro-turbo-v1">wanx2.1-pro-turbo-v1</option>
                  <option value="wanx2.1-turbo-v1">wanx2.1-turbo-v1</option>
                </select>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  不同模型效果和价格不同
                </p>
              </div>
            </div>

            {/* 安全提示 */}
            <div className="mt-3 flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>
                API Key 仅存储在您的浏览器本地（LocalStorage），不会上传到服务器。每次调用都会直接从您的浏览器发送到阿里云。
              </span>
            </div>
          </div>

          {/* 提示词输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              优化提示词（可选，默认适合拼豆风格）
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={DEFAULT_CONFIG.PROMPT}
              disabled={isProcessing || !!previewImage}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              提示词将指导 AI 将图片转换为像素艺术风格，更适合制作拼豆图案
            </p>
          </div>

          {/* 图片对比 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* 原图 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">原图</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={imageSrc}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* 优化后 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 优化后</h3>
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Optimized"
                    className="w-full h-full object-contain"
                  />
                ) : isProcessing ? (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI 处理中...</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{progress}%</p>
                    {/* 进度条 */}
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 mx-auto overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-400 dark:text-gray-600">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">配置 API Key 后点击优化</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="whitespace-pre-line">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {!previewImage ? (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleOptimize}
                disabled={isProcessing || !apiKey.trim()}
                className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    处理中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    开始优化
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                重新优化
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                使用此图
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
