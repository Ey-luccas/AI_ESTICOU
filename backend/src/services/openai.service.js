import OpenAI from 'openai';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import promptBuilder from './prompt.service.js';

class OpenAIService {
  constructor() {
    this.isConfigured = !!process.env.OPENAI_API_KEY;
    if (this.isConfigured) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI configurado');
    } else {
      console.warn(
        '⚠️  OpenAI não configurado. Geração de variações não funcionará.',
      );
      this.client = null;
    }
    this.model = process.env.OPENAI_MODEL || 'dall-e-3';
    this.imageSize = process.env.OPENAI_IMAGE_SIZE || '1024x1024';
    this.quality = process.env.OPENAI_QUALITY || 'standard';
  }

  /**
   * Gera uma nova imagem baseada em prompt
   */
  async generateImage(prompt, options = {}) {
    if (!this.isConfigured) {
      throw new Error(
        'OpenAI não está configurado. Configure OPENAI_API_KEY no .env',
      );
    }
    try {
      const startTime = Date.now();

      const response = await this.client.images.generate({
        model: this.model,
        prompt: prompt,
        n: 1,
        size: options.size || this.imageSize,
        quality: options.quality || this.quality,
        response_format: 'url',
      });

      const generationTime = (Date.now() - startTime) / 1000;

      return {
        success: true,
        imageUrl: response.data[0].url,
        revisedPrompt: response.data[0].revised_prompt,
        generationTime,
        metadata: {
          model: this.model,
          size: options.size || this.imageSize,
          quality: options.quality || this.quality,
        },
      };
    } catch (error) {
      console.error('Erro OpenAI:', error);
      throw new Error(this.handleOpenAIError(error));
    }
  }

  /**
   * Edita uma imagem existente (para uso futuro com DALL-E edit)
   */
  async editImage(imageUrl, prompt, maskUrl = null) {
    try {
      // DALL-E edit requer a imagem em formato PNG
      // Esta funcionalidade está em beta e pode não estar disponível para todos

      const response = await this.client.images.edit({
        image: imageUrl,
        mask: maskUrl,
        prompt: prompt,
        n: 1,
        size: this.imageSize,
      });

      return {
        success: true,
        imageUrl: response.data[0].url,
      };
    } catch (error) {
      throw new Error(this.handleOpenAIError(error));
    }
  }

  /**
   * Cria variação de uma imagem existente
   */
  async createVariation(imageUrl) {
    try {
      const response = await this.client.images.createVariation({
        image: imageUrl,
        n: 1,
        size: this.imageSize,
      });

      return {
        success: true,
        imageUrl: response.data[0].url,
      };
    } catch (error) {
      throw new Error(this.handleOpenAIError(error));
    }
  }

  /**
   * Analisa imagem com GPT-4 Vision (para uso futuro)
   */
  async analyzeImage(imageUrl, customPrompt = null) {
    try {
      const prompt = customPrompt || promptBuilder.buildAnalysisPrompt();

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 500,
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
      };
    } catch (error) {
      throw new Error(this.handleOpenAIError(error));
    }
  }

  /**
   * Faz upload da imagem gerada para o Cloudinary
   */
  async uploadToCloudinary(imageUrl, folder = 'lualabs/variations') {
    const { isCloudinaryConfigured } = await import('../config/cloudinary.js');

    if (!isCloudinaryConfigured()) {
      throw new Error(
        'Cloudinary não está configurado. Configure as variáveis CLOUDINARY_* no .env',
      );
    }

    try {
      // Download da imagem da OpenAI
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      // Upload para Cloudinary
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: folder,
              resource_type: 'image',
              transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(response.data);
      });
    } catch (error) {
      throw new Error('Erro ao fazer upload da imagem: ' + error.message);
    }
  }

  /**
   * Pipeline completo: gera imagem e faz upload
   */
  async generateAndUpload(prompt, options = {}) {
    try {
      // 1. Gera imagem com OpenAI
      const generated = await this.generateImage(prompt, options);

      // 2. Faz upload para Cloudinary
      const uploaded = await this.uploadToCloudinary(generated.imageUrl);

      return {
        success: true,
        imageUrl: uploaded.secure_url,
        imagePublicId: uploaded.public_id,
        thumbnailUrl: uploaded.secure_url.replace(
          '/upload/',
          '/upload/w_300,h_300,c_fill/',
        ),
        revisedPrompt: generated.revisedPrompt,
        generationTime: generated.generationTime,
        metadata: {
          ...generated.metadata,
          cloudinaryPublicId: uploaded.public_id,
          format: uploaded.format,
          width: uploaded.width,
          height: uploaded.height,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Trata erros da API OpenAI
   */
  handleOpenAIError(error) {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.error?.message || 'Erro desconhecido';

      switch (status) {
        case 400:
          return `Requisição inválida: ${message}`;
        case 401:
          return 'Chave de API inválida ou expirada';
        case 429:
          return 'Limite de requisições excedido. Tente novamente em alguns minutos';
        case 500:
          return 'Erro no servidor da OpenAI. Tente novamente mais tarde';
        default:
          return `Erro OpenAI (${status}): ${message}`;
      }
    }
    return error.message || 'Erro ao comunicar com OpenAI';
  }

  /**
   * Verifica se a API está configurada corretamente
   */
  async testConnection() {
    if (!this.isConfigured) {
      return {
        success: false,
        message:
          'OpenAI não está configurado. Configure OPENAI_API_KEY no .env',
      };
    }
    try {
      await this.client.models.list();
      return { success: true, message: 'Conexão com OpenAI OK' };
    } catch (error) {
      return {
        success: false,
        message: this.handleOpenAIError(error),
      };
    }
  }
}

export default new OpenAIService();
