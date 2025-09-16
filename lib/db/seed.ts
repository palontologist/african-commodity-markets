import { db } from './index';
import { countries, commodities, markets, commodityGrades } from './schema';

export async function seedDatabase() {
  if (!db) {
    throw new Error('Database not available. Please check your environment variables.');
  }

  try {
    console.log('Seeding database...');

    // Seed Countries (Africa + LATAM)
    const countryData = await db.insert(countries).values([
      {
        name: 'Ghana',
        code: 'GH',
        region: 'West Africa',
        currency: 'GHS',
      },
      {
        name: 'Kenya',
        code: 'KE',
        region: 'East Africa',
        currency: 'KES',
      },
      {
        name: 'Nigeria',
        code: 'NG',
        region: 'West Africa',
        currency: 'NGN',
      },
      {
        name: 'South Africa',
        code: 'ZA',
        region: 'Southern Africa',
        currency: 'ZAR',
      },
      {
        name: 'Côte d\'Ivoire',
        code: 'CI',
        region: 'West Africa',
        currency: 'XOF',
      },
      {
        name: 'Ethiopia',
        code: 'ET',
        region: 'East Africa',
        currency: 'ETB',
      },
      // LATAM
      {
        name: 'Brazil',
        code: 'BR',
        region: 'LATAM',
        currency: 'BRL',
      },
      {
        name: 'Colombia',
        code: 'CO',
        region: 'LATAM',
        currency: 'COP',
      },
      {
        name: 'Peru',
        code: 'PE',
        region: 'LATAM',
        currency: 'PEN',
      },
      {
        name: 'Mexico',
        code: 'MX',
        region: 'LATAM',
        currency: 'MXN',
      },
    ]).returning();

    console.log('Countries seeded:', countryData.length);

    // Seed Commodities
    const commodityData = await db.insert(commodities).values([
      {
        name: 'Cocoa',
        code: 'COCOA',
        category: 'Agricultural',
        unit: 'MT',
        description: 'Premium quality cocoa beans for export',
      },
      {
        name: 'Coffee',
        code: 'COFFEE',
        category: 'Agricultural',
        unit: 'kg',
        description: 'Specialty grade coffee beans',
      },
      {
        name: 'Tea',
        code: 'TEA',
        category: 'Agricultural',
        unit: 'kg',
        description: 'CTC and orthodox tea grades',
      },
      {
        name: 'Gold',
        code: 'GOLD',
        category: 'Precious Metals',
        unit: 'oz',
        description: 'Investment grade gold',
      },
      {
        name: 'Avocado',
        code: 'AVOCADO',
        category: 'Agricultural',
        unit: 'kg',
        description: 'Export quality avocados',
      },
      {
        name: 'Macadamia',
        code: 'MACADAMIA',
        category: 'Agricultural',
        unit: 'kg',
        description: 'Premium macadamia nuts',
      },
    ]).returning();

    console.log('Commodities seeded:', commodityData.length);

    // Seed Markets (Africa + LATAM)
    const marketData = await db.insert(markets).values([
      {
        name: 'Ghana Cocoa Board',
        location: 'Accra',
        countryId: countryData.find(c => c.code === 'GH')!.id,
        type: 'Auction',
        operatingHours: '9:00 AM - 5:00 PM',
        contactInfo: 'info@cocobod.gh',
      },
      {
        name: 'Nairobi Coffee Exchange',
        location: 'Nairobi',
        countryId: countryData.find(c => c.code === 'KE')!.id,
        type: 'Exchange',
        operatingHours: '9:00 AM - 3:00 PM',
        contactInfo: 'info@nce.co.ke',
      },
      {
        name: 'Mombasa Tea Auction',
        location: 'Mombasa',
        countryId: countryData.find(c => c.code === 'KE')!.id,
        type: 'Auction',
        operatingHours: '8:00 AM - 12:00 PM',
        contactInfo: 'info@mombasa-tea.com',
      },
      {
        name: 'Johannesburg Gold Market',
        location: 'Johannesburg',
        countryId: countryData.find(c => c.code === 'ZA')!.id,
        type: 'Exchange',
        operatingHours: '9:00 AM - 5:00 PM',
        contactInfo: 'info@jse.co.za',
      },
      // LATAM
      {
        name: 'Brazil Coffee Exchange (CECAFÉ proxy)',
        location: 'São Paulo',
        countryId: countryData.find(c => c.code === 'BR')!.id,
        type: 'Exchange',
        operatingHours: '9:00 AM - 5:00 PM',
        contactInfo: 'info@cecafe.com.br',
      },
      {
        name: 'Colombia National Coffee Federation',
        location: 'Bogotá',
        countryId: countryData.find(c => c.code === 'CO')!.id,
        type: 'Exchange',
        operatingHours: '9:00 AM - 5:00 PM',
        contactInfo: 'info@federaciondecafeteros.org',
      },
      {
        name: 'Peru Agricultural Exchange',
        location: 'Lima',
        countryId: countryData.find(c => c.code === 'PE')!.id,
        type: 'Exchange',
        operatingHours: '9:00 AM - 5:00 PM',
        contactInfo: 'info@agromercado.pe',
      },
      {
        name: 'Mexico Avocado Board Market',
        location: 'Michoacán',
        countryId: countryData.find(c => c.code === 'MX')!.id,
        type: 'Auction',
        operatingHours: '9:00 AM - 5:00 PM',
        contactInfo: 'info@avocadosfrommexico.com',
      },
    ]).returning();

    console.log('Markets seeded:', marketData.length);

    // Seed Commodity Grades
    const gradeData = await db.insert(commodityGrades).values([
      // Cocoa grades
      {
        commodityId: commodityData.find(c => c.code === 'COCOA')!.id,
        grade: 'Grade I',
        description: 'Premium quality cocoa beans',
        qualityStandards: 'Max 3% defects, moisture content 7.5%',
      },
      {
        commodityId: commodityData.find(c => c.code === 'COCOA')!.id,
        grade: 'Grade II',
        description: 'Standard quality cocoa beans',
        qualityStandards: 'Max 4% defects, moisture content 7.5%',
      },
      // Coffee grades
      {
        commodityId: commodityData.find(c => c.code === 'COFFEE')!.id,
        grade: 'AA',
        description: 'Top grade coffee beans',
        qualityStandards: 'Screen size 17-18, max 10 defects per 300g',
      },
      {
        commodityId: commodityData.find(c => c.code === 'COFFEE')!.id,
        grade: 'AB',
        description: 'High quality coffee beans',
        qualityStandards: 'Screen size 15-16, max 15 defects per 300g',
      },
      // Tea grades
      {
        commodityId: commodityData.find(c => c.code === 'TEA')!.id,
        grade: 'PEKOE',
        description: 'Premium orthodox tea',
        qualityStandards: 'Whole leaf, no fannings',
      },
      {
        commodityId: commodityData.find(c => c.code === 'TEA')!.id,
        grade: 'BOP',
        description: 'Broken Orange Pekoe',
        qualityStandards: 'Broken leaf, good liquor',
      },
    ]).returning();

    console.log('Commodity grades seeded:', gradeData.length);
    console.log('Database seeding completed successfully!');
    
    return {
      countries: countryData,
      commodities: commodityData,
      markets: marketData,
      grades: gradeData,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}