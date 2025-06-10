# cityofpasadena
# Project Coordination System for the City of Pasadena 

A comprehensive municipal project management platform that enables departments to coordinate geofenced project areas, prevent scheduling conflicts, and maintain transparent communication across city operations.

## Overview

This system allows city departments and contractors to register project areas with geographic boundaries, track project lifecycles, and automatically detect potential conflicts in timing or location overlap. The platform ensures efficient coordination of public works, construction, and municipal projects.

## Features

### 🗺️ Geographic Project Management
- **Interactive Maps Interface**: User-friendly GUI for defining project boundaries
- **Geofenced Areas**: Draw and store precise geographic boundaries for each project
- **Visual Project Overlay**: See all active projects on a unified map view

### 📋 Project Registration
- **Department Assignment**: Link projects to specific city departments
- **Duration Tracking**: Set start dates, estimated completion, and actual timelines
- **Access Restrictions**: Mark areas as restricted or open during project execution
- **Contractor Integration**: Include contractor information and contact details when applicable

### ⚠️ Conflict Detection & Alerts
- **Automated Overlap Detection**: Cross-reference all projects for geographic and temporal conflicts
- **Real-time Alerts**: Instant notifications when potential conflicts are identified
- **Department Coordination**: Direct contact information for conflicting project managers
- **Conflict Resolution Workflow**: Streamlined process for resolving scheduling conflicts

### 📊 Project Lifecycle Management
- **Individual Project Pages**: Dedicated dashboard for each project (accessible via unique project ID)
- **Status Tracking**: Monitor project phases from planning to completion
- **Delay Notifications**: Alert system for project extensions or delays
- **Stakeholder Updates**: Automated notifications to affected departments and contractors

## System Architecture

### Database Schema
- **Projects Table**: Core project information, departments, dates, restrictions
- **Geofences Table**: Geographic boundary data and coordinates
- **Contractors Table**: Contractor details and contact information
- **Conflicts Table**: Detected overlaps and resolution status
- **Notifications Table**: Alert history and delivery status

### Core Components
- **Map Interface**: Interactive mapping system for boundary definition
- **Conflict Engine**: Algorithm for detecting geographic and temporal overlaps
- **Notification System**: Multi-channel alert delivery (email, dashboard, SMS)
- **Project Dashboard**: Individual project tracking and lifecycle management

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd project-coordination-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure database connection, map API keys, and notification settings

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

## Configuration

### Environment Variables
```env
DATABASE_URL=your_database_connection_string
MAPS_API_KEY=your_mapping_service_api_key
NOTIFICATION_EMAIL_SERVICE=your_email_service_config
SMS_SERVICE_KEY=your_sms_service_key
```

### Database Setup
1. Create a new database instance
2. Run the provided migration scripts
3. Configure connection settings in your environment file

## Usage

### For Department Managers
1. **Create New Project**: Access the map interface and draw project boundaries
2. **Enter Details**: Specify department, duration, restrictions, and contractor info
3. **Monitor Conflicts**: Receive automatic alerts for any scheduling or location conflicts
4. **Track Progress**: Use project ID to access dedicated project dashboard

### For System Administrators
1. **Manage Departments**: Add/edit city department information
2. **Resolve Conflicts**: Facilitate communication between conflicting project teams
3. **System Monitoring**: Track overall project load and resource allocation

## API Endpoints

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Retrieve project details
- `PUT /api/projects/:id` - Update project information
- `DELETE /api/projects/:id` - Remove project

### Conflicts
- `GET /api/conflicts` - List all detected conflicts
- `POST /api/conflicts/:id/resolve` - Mark conflict as resolved

### Geofences
- `POST /api/geofences` - Create geographic boundary
- `GET /api/geofences/overlap` - Check for geographic overlaps

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## Technology Stack

- **Frontend**: React.js with mapping library integration
- **Backend**: Node.js/Express or Python/Django
- **Database**: PostgreSQL with PostGIS for geographic data
- **Maps**: Google Maps API or OpenStreetMap
- **Notifications**: Email/SMS integration services

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For technical support or feature requests:
- Create an issue in the GitHub repository
- Contact the development team at [support-email]
- Review the documentation wiki for detailed setup guides

## Roadmap

- [ ] Mobile application for field updates
- [ ] Integration with existing city management systems
- [ ] Advanced analytics and reporting dashboard
- [ ] Public-facing project information portal
- [ ] Resource allocation optimization features
