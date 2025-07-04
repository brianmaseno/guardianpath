// Azure Maps configuration
export const azureMapsConfig = {
  subscriptionKey: process.env.AZURE_MAPS_KEY || '',
  clientId: process.env.AZURE_MAPS_CLIENT_ID || '',
  endpoint: 'https://atlas.microsoft.com'
}

// Azure Cognitive Services configuration
export const azureCognitiveConfig = {
  endpoint: process.env.AZURE_VISION_ENDPOINT || '',
  key: process.env.AZURE_VISION_KEY || ''
}

// Azure Maps API helpers
export class AzureMapsService {
  private subscriptionKey: string

  constructor() {
    this.subscriptionKey = azureMapsConfig.subscriptionKey || ''
  }

  /**
   * Get route between two points
   */
  async getRoute(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<any> {
    try {
      if (!this.subscriptionKey) {
        throw new Error('Azure Maps subscription key not configured')
      }

      const response = await fetch(
        `${azureMapsConfig.endpoint}/route/directions/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${start.lat},${start.lng}:${end.lat},${end.lng}&travelMode=pedestrian&routeType=safest`
      )
      
      if (!response.ok) {
        throw new Error(`Azure Maps API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting route from Azure Maps:', error)
      throw error
    }
  }

  /**
   * Search for nearby safe places (police stations, hospitals, etc.)
   */
  async findNearbyPlaces(location: { lat: number; lng: number }, category: string = 'hospital'): Promise<any[]> {
    try {
      if (!this.subscriptionKey) {
        throw new Error('Azure Maps subscription key not configured')
      }

      const response = await fetch(
        `${azureMapsConfig.endpoint}/search/nearby/json?api-version=1.0&subscription-key=${this.subscriptionKey}&lat=${location.lat}&lon=${location.lng}&categorySet=${category}&radius=5000`
      )
      
      if (!response.ok) {
        throw new Error(`Azure Maps Search API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Error searching nearby places:', error)
      throw error
    }
  }

  /**
   * Reverse geocoding - get address from coordinates
   */
  async getAddressFromCoordinates(location: { lat: number; lng: number }): Promise<any> {
    try {
      if (!this.subscriptionKey) {
        throw new Error('Azure Maps subscription key not configured')
      }

      const response = await fetch(
        `${azureMapsConfig.endpoint}/search/address/reverse/json?api-version=1.0&subscription-key=${this.subscriptionKey}&query=${location.lat},${location.lng}`
      )
      
      if (!response.ok) {
        throw new Error(`Azure Maps Reverse Geocoding error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.addresses?.[0] || null
    } catch (error) {
      console.error('Error getting address from coordinates:', error)
      throw error
    }
  }
}

// Azure Vision Service for image analysis
export class AzureVisionService {
  private endpoint: string
  private key: string

  constructor() {
    this.endpoint = azureCognitiveConfig.endpoint
    this.key = azureCognitiveConfig.key
  }

  /**
   * Analyze image using Azure Computer Vision
   */
  async analyzeImage(imageData: string): Promise<any> {
    try {
      if (!this.endpoint || !this.key) {
        throw new Error('Azure Vision endpoint or key not configured')
      }

      // Convert base64 to blob
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')

      const response = await fetch(
        `${this.endpoint}/vision/v3.2/analyze?visualFeatures=Objects,Description,Tags,Adult&details=Landmarks&language=en`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.key,
            'Content-Type': 'application/octet-stream'
          },
          body: imageBuffer
        }
      )

      if (!response.ok) {
        throw new Error(`Azure Vision API error: ${response.statusText}`)
      }

      const analysisResult = await response.json()
      
      return {
        description: analysisResult.description?.captions?.[0]?.text || 'No description available',
        confidence: analysisResult.description?.captions?.[0]?.confidence || 0,
        objects: analysisResult.objects?.map((obj: any) => ({
          name: obj.object,
          confidence: obj.confidence,
          rectangle: obj.rectangle
        })) || [],
        tags: analysisResult.tags?.map((tag: any) => ({
          name: tag.name,
          confidence: tag.confidence
        })) || [],
        isAdultContent: analysisResult.adult?.isAdultContent || false,
        isRacyContent: analysisResult.adult?.isRacyContent || false,
        landmarks: analysisResult.categories?.filter((cat: any) => cat.detail?.landmarks)
          .flatMap((cat: any) => cat.detail.landmarks) || []
      }
    } catch (error) {
      console.error('Error analyzing image with Azure Vision:', error)
      throw error
    }
  }

  /**
   * Extract text from image (OCR)
   */
  async extractText(imageData: string): Promise<any> {
    try {
      if (!this.endpoint || !this.key) {
        throw new Error('Azure Vision endpoint or key not configured')
      }

      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')

      const response = await fetch(
        `${this.endpoint}/vision/v3.2/ocr?language=en&detectOrientation=true`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': this.key,
            'Content-Type': 'application/octet-stream'
          },
          body: imageBuffer
        }
      )

      if (!response.ok) {
        throw new Error(`Azure OCR API error: ${response.statusText}`)
      }

      const ocrResult = await response.json()
      
      // Extract all text from regions
      const extractedText = ocrResult.regions?.flatMap((region: any) =>
        region.lines?.flatMap((line: any) =>
          line.words?.map((word: any) => word.text)
        )
      ).join(' ') || ''

      return {
        text: extractedText,
        language: ocrResult.language,
        orientation: ocrResult.orientation,
        textAngle: ocrResult.textAngle
      }
    } catch (error) {
      console.error('Error extracting text from image:', error)
      throw error
    }
  }
}

// Export service instances
export const azureMaps = new AzureMapsService()
export const azureVision = new AzureVisionService()
