const { getSettings, updateSettings } = require('../utils/settings');
const { validateStoreSettings } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * Get store settings
 */
function getStoreSettings(req, res) {
    const settings = getSettings();
    res.json({
        status: 'success',
        data: {
            store_name: settings.store_name,
            store_address: settings.store_address,
            store_phone: settings.store_phone,
            store_footer: settings.store_footer,
            paper_size: settings.paper_size
        }
    });
}

/**
 * Update store settings
 */
function updateStoreSettings(req, res) {
    try {
        const { store_name, store_address, store_phone, store_footer, paper_size } = req.body;
        
        // Validasi store settings
        const validation = validateStoreSettings(req.body);
        if (!validation.valid) {
            logger.warn('Update store settings gagal: validasi error', { errors: validation.errors });
            return res.status(400).json({
                status: 'error',
                message: 'Data tidak valid',
                errors: validation.errors
            });
        }
        
        const updates = {};
        if (store_name !== undefined) updates.store_name = store_name.trim();
        if (store_address !== undefined) updates.store_address = store_address.trim();
        if (store_phone !== undefined) updates.store_phone = store_phone.trim();
        if (store_footer !== undefined) updates.store_footer = store_footer.trim();
        if (paper_size !== undefined) {
            if (['80mm', '58mm'].includes(paper_size)) {
                updates.paper_size = paper_size;
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: 'Paper size tidak valid. Pilih 80mm atau 58mm'
                });
            }
        }
        
        // Update dan simpan ke file
        if (updateSettings(updates)) {
            const settings = getSettings();
            logger.success('Pengaturan toko berhasil diperbarui', updates);
            res.json({
                status: 'success',
                message: 'Pengaturan toko berhasil diperbarui',
                data: {
                    store_name: settings.store_name,
                    store_address: settings.store_address,
                    store_phone: settings.store_phone,
                    store_footer: settings.store_footer,
                    paper_size: settings.paper_size
                }
            });
        } else {
            throw new Error('Gagal menyimpan pengaturan');
        }
    } catch (error) {
        logger.error('Error updating store settings', { error: error.message });
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

/**
 * Backup settings
 */
function backupSettings(req, res) {
    try {
        const settings = getSettings();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `printer-settings-backup-${timestamp}.json`;
        
        logger.info('Settings backup diminta');
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(settings);
    } catch (error) {
        logger.error('Error backup settings', { error: error.message });
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

/**
 * Restore settings
 */
function restoreSettings(req, res) {
    try {
        const backupData = req.body;
        
        // Validasi struktur backup
        if (!backupData || typeof backupData !== 'object') {
            return res.status(400).json({
                status: 'error',
                message: 'Data backup tidak valid'
            });
        }
        
        // Validasi fields yang ada
        const validation = validateStoreSettings(backupData);
        if (!validation.valid) {
            logger.warn('Restore settings gagal: validasi error', { errors: validation.errors });
            return res.status(400).json({
                status: 'error',
                message: 'Data backup tidak valid',
                errors: validation.errors
            });
        }
        
        // Update settings
        if (updateSettings(backupData)) {
            logger.success('Settings berhasil di-restore dari backup');
            res.json({
                status: 'success',
                message: 'Settings berhasil di-restore',
                data: getSettings()
            });
        } else {
            throw new Error('Gagal restore settings');
        }
    } catch (error) {
        logger.error('Error restore settings', { error: error.message });
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

module.exports = {
    getStoreSettings,
    updateStoreSettings,
    backupSettings,
    restoreSettings
};
