// Serviço para construir prompts otimizados para DALL-E

export class PromptBuilder {
  constructor() {
    this.baseStyle =
      'high quality professional graphic design, clean and modern aesthetic, commercial use';
  }

  buildPrompt(artCategory, parameters) {
    const {
      currentProduct,
      newProduct,
      currentPrice,
      newPrice,
      currentText,
      newText,
      notes,
    } = parameters;

    let prompt = '';

    // Define estilo base por categoria
    const categoryStyles = {
      banner: 'promotional banner design',
      story: 'Instagram story design, vertical format 9:16',
      feed: 'Instagram feed post, square format',
      menu: 'restaurant menu design, elegant typography',
      poster: 'modern poster design, eye-catching',
      logo: 'professional logo design, minimal and memorable',
    };

    const style = categoryStyles[artCategory] || 'graphic design';
    prompt += `Create a ${style}, `;

    // Produto
    if (newProduct) {
      prompt += `featuring ${newProduct}`;
      if (currentProduct) {
        prompt += ` (replacing ${currentProduct})`;
      }
      prompt += `, `;
    }

    // Texto principal
    if (newText) {
      prompt += `with bold text saying "${newText}"`;
      if (currentText) {
        prompt += ` (instead of "${currentText}")`;
      }
      prompt += `, `;
    }

    // Preço
    if (newPrice) {
      prompt += `displaying price ${newPrice}`;
      if (currentPrice) {
        prompt += ` (updated from ${currentPrice})`;
      }
      prompt += `, `;
    }

    // Notas adicionais do usuário
    if (notes) {
      prompt += `${notes}, `;
    }

    // Adiciona estilo base
    prompt += this.baseStyle;

    // Limpa e formata
    prompt = prompt.replace(/,\s*,/g, ',').replace(/,\s*$/g, '').trim();

    return prompt;
  }

  buildEditPrompt(parameters) {
    const { currentProduct, newProduct, currentText, newText, notes } =
      parameters;

    let editInstructions = [];

    if (newProduct && currentProduct) {
      editInstructions.push(`Replace the ${currentProduct} with ${newProduct}`);
    }

    if (newText && currentText) {
      editInstructions.push(
        `Change the text from "${currentText}" to "${newText}"`,
      );
    }

    if (notes) {
      editInstructions.push(notes);
    }

    return (
      editInstructions.join('. ') +
      '. Keep the overall style and layout similar.'
    );
  }

  // Para uso futuro com GPT-4 Vision (análise de imagem)
  buildAnalysisPrompt() {
    return `Analyze this image and describe:
    1. Main visual elements
    2. Color palette
    3. Typography style
    4. Layout composition
    5. Suggested improvements`;
  }
}

export default new PromptBuilder();
