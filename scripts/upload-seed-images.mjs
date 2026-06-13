import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Parse .env.local manually to avoid external dependency
const envFileContent = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envFileContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const imagesDir = 'public/images/products'
const files = fs.readdirSync(imagesDir)

const mapping = {
  'acai-300ml.jpg': 'Açaí 300ml',
  'acai-500ml.jpg': 'Açaí 500ml',
  'acai-700ml.jpg': 'Açaí 700ml',
  'combo-acai-agua.jpg': 'Combo Açaí + Água',
  'combo-acai-suco.jpg': 'Combo Açaí + Suco',
  'suco-natural.jpg': 'Suco Natural',
  'agua-mineral.jpg': 'Água Mineral',
  'refrigerante.jpg': 'Refrigerante Lata',
  'granola.jpg': 'Granola',
  'leite-condensado.jpg': 'Leite Condensado'
}

async function main() {
  console.log('Starting seed image upload...')

  // 1. Upload Logo
  const logoPath = 'public/images/logo.png'
  if (fs.existsSync(logoPath)) {
    console.log('Uploading brand logo to store-assets...')
    const logoBuffer = fs.readFileSync(logoPath)

    const { error: logoUploadError } = await supabase.storage
      .from('store-assets')
      .upload('logo.png', logoBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (logoUploadError) {
      console.error('Failed to upload logo:', logoUploadError.message)
    } else {
      const { data: logoUrlData } = supabase.storage
        .from('store-assets')
        .getPublicUrl('logo.png')

      const logoPublicUrl = logoUrlData.publicUrl
      console.log(`Logo uploaded. Public URL: ${logoPublicUrl}`)

      console.log('Updating stores table with logo URL...')
      const { error: storeUpdateError } = await supabase
        .from('stores')
        .update({ logo_url: logoPublicUrl })
        .eq('slug', 'acai-top')

      if (storeUpdateError) {
        console.error('Failed to update stores table:', storeUpdateError.message)
      } else {
        console.log('Stores table updated successfully!')
      }
    }
  } else {
    console.log('Logo file not found at', logoPath)
  }

  // 2. Upload Product Images
  for (const filename of files) {
    const productName = mapping[filename]
    if (!productName) {
      console.log(`Skipping file ${filename} (no mapping found)`)
      continue
    }

    const filePath = path.join(imagesDir, filename)
    const fileBuffer = fs.readFileSync(filePath)

    console.log(`Uploading ${filename} for product "${productName}"...`)
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error(`Failed to upload ${filename}:`, uploadError.message)
      continue
    }

    // Get Public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)

    const publicUrl = urlData.publicUrl
    console.log(`Uploaded successfully. Public URL: ${publicUrl}`)

    // Update product record
    console.log(`Updating database for "${productName}"...`)
    const { error: updateError } = await supabase
      .from('products')
      .update({ image_url: publicUrl })
      .eq('name', productName)

    if (updateError) {
      console.error(`Failed to update database for "${productName}":`, updateError.message)
    } else {
      console.log(`Successfully updated database for "${productName}"!`)
    }
  }

  console.log('All done!')
}

main().catch(console.error)
