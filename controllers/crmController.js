const axios = require('axios');

const CRM_BASE_URL = process.env.CRM_BASE_URL || 'https://api.crm.example.com';
const CRM_API_KEY = process.env.CRM_API_KEY || '';

// Obtener contactos prospectos desde CRM
exports.getProspectos = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);
    const search = (req.query.search || '').toString();

    const response = await axios.get(`${CRM_BASE_URL}/contactos`, {
      headers: {
        'Authorization': `Bearer ${CRM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        tipo: 'PROSPECTO',
        page,
        limit,
        q: search || undefined,
      },
    });

    // Normalizar respuesta
    const data = (response.data?.data || response.data || []).map((c) => ({
      id: c.id || c.contacto_id,
      nombre: c.nombre,
      email: c.email,
      telefono: c.telefono,
      direccion: c.direccion,
      ciudad: c.ciudad,
      pais: c.pais,
      tipo: c.tipo || c.estado_contacto,
    })).filter((c) => (c.tipo || '').toUpperCase().includes('PROSPECT'));

    res.json({ success: true, data });
  } catch (error) {
    console.error('CRM getProspectos error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Error obteniendo prospectos', error: error.message });
  }
};
