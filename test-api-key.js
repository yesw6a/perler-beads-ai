/**
 * 测试阿里云百炼 API Key 是否有效
 * 使用方法：node test-api-key.js
 */

const ALIBABA_API_KEY = process.env.ALIBABA_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME || 'wanx-v1';
const ALIBABA_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/images/generations';

if (!ALIBABA_API_KEY) {
  console.error('❌ 错误：缺少 ALIBABA_API_KEY 环境变量');
  console.log('请设置：export ALIBABA_API_KEY=sk-your-key');
  process.exit(1);
}

console.log('🔍 测试阿里云百炼 API...');
console.log('API Key:', ALIBABA_API_KEY.substring(0, 10) + '...');
console.log('Model:', MODEL_NAME);
console.log('API URL:', ALIBABA_API_URL);
console.log('---');

// 简单的测试图片（1x1 红色像素）
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

const requestBody = {
  model: MODEL_NAME,
  prompt: 'A red pixel',
  image: testImage,
  n: 1,
  size: '1024x1024'
};

async function testApiKey() {
  try {
    console.log('📤 发送测试请求...');
    
    const response = await fetch(ALIBABA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ALIBABA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 响应状态:', response.status);
    
    const responseText = await response.text();
    console.log('📄 响应内容:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.data && data.data[0] && data.data[0].url) {
        console.log('✅ API Key 有效！');
        console.log('🖼️ 生成图片 URL:', data.data[0].url);
        return true;
      }
    }

    // 解析错误
    try {
      const errorData = JSON.parse(responseText);
      const errorMessage = errorData.error?.message || '';
      
      if (errorMessage.includes('invalid') || errorMessage.includes('Invalid')) {
        console.log('❌ API Key 无效！请检查 ALIBABA_API_KEY 是否正确');
      } else if (errorMessage.includes('model') || errorMessage.includes('Model')) {
        console.log('❌ 模型名称无效！当前模型:', MODEL_NAME);
        console.log('💡 建议使用：wanx-v1, wanx2.1-pro-turbo-v1, wanx2.1-turbo-v1');
      } else {
        console.log('❌ API 错误:', errorMessage);
      }
    } catch (e) {
      console.log('❌ 无法解析错误响应');
    }

    return false;

  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    console.log('💡 请检查网络连接');
    return false;
  }
}

testApiKey().then(success => {
  if (success) {
    console.log('\n✅ 测试完成！API Key 可用');
    process.exit(0);
  } else {
    console.log('\n❌ 测试失败！请检查配置');
    console.log('\n💡 建议步骤:');
    console.log('1. 访问 https://bailian.console.aliyun.com/');
    console.log('2. 检查 API Key 是否正确');
    console.log('3. 确认模型名称有效（建议使用 wanx-v1）');
    console.log('4. 确认账号已开通通义万相服务');
    process.exit(1);
  }
});
