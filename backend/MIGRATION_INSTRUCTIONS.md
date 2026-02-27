# Database Migration Instructions

## Important: Run This Migration

The Pharmacy model and pharmacyId field have been added to the schema. You need to run a migration to update your database.

### Steps:

1. **Generate the migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_pharmacy_model_and_pharmacist_relationship
   ```

2. **The migration will:**
   - Create a new `pharmacies` table
   - Add `pharmacyId` field to `pharmacist_profiles` table
   - Add index on `pharmacyId` in `pharmacist_profiles`

3. **Restart your backend server** after the migration completes.

### What was added:

- **Pharmacy Model**: Similar to Hospital, with name, address, city, country, phone, email, location coordinates
- **PharmacistProfile.pharmacyId**: Allows pharmacists to be assigned to pharmacies
- **Relationships**: Pharmacy can have many pharmacists, pharmacist can belong to one pharmacy

### API Endpoints Now Available:

**Hospitals:**
- `POST /api/v1/hospitals` - Create hospital
- `GET /api/v1/hospitals` - Get all hospitals
- `GET /api/v1/hospitals/:id` - Get one hospital
- `PATCH /api/v1/hospitals/:id` - Update hospital
- `DELETE /api/v1/hospitals/:id` - Delete hospital
- `PATCH /api/v1/hospitals/:id/toggle-active` - Toggle active status
- `GET /api/v1/hospitals/:id/doctors` - Get hospital's doctors
- `PATCH /api/v1/hospitals/:id/assign-doctor/:doctorId` - Assign doctor to hospital
- `DELETE /api/v1/hospitals/:id/remove-doctor/:doctorId` - Remove doctor from hospital

**Pharmacies:**
- `POST /api/v1/pharmacies` - Create pharmacy
- `GET /api/v1/pharmacies` - Get all pharmacies
- `GET /api/v1/pharmacies/:id` - Get one pharmacy
- `PATCH /api/v1/pharmacies/:id` - Update pharmacy
- `DELETE /api/v1/pharmacies/:id` - Delete pharmacy
- `PATCH /api/v1/pharmacies/:id/toggle-active` - Toggle active status
- `GET /api/v1/pharmacies/:id/pharmacists` - Get pharmacy's pharmacists
- `PATCH /api/v1/pharmacies/:id/assign-pharmacist/:pharmacistId` - Assign pharmacist to pharmacy
- `DELETE /api/v1/pharmacies/:id/remove-pharmacist/:pharmacistId` - Remove pharmacist from pharmacy
