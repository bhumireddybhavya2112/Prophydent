const SupabaseApiClient = require('./SupabaseApiClient');
const BackendApiClient = require('./BackendApiClient');

class ApiClient {
    constructor() {
        this.supabase = SupabaseApiClient;
        this.backend = BackendApiClient;
    }
}

module.exports = new ApiClient();
