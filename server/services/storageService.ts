/**
 * ==============================================================================
 * NurseLink AI - Service de Stockage
 * ==============================================================================
 *
 * Service centralisé pour les interactions avec la base de données
 * Utilise Prisma comme ORM
 * ==============================================================================
 */

import { prisma } from "../lib/prisma"
import { MissionStatus, ApplicationStatus, UserRole } from "@prisma/client"

export interface Mission {
  id: string
  title: string
  description: string
  establishmentId: string
  specializations: string[]
  duration: number
  hourlyRate: number
  startDate: Date
  endDate: Date | null
  location: string
  requirements: string | null
  status: MissionStatus
  createdAt: Date
  updatedAt: Date
}

export interface MissionApplication {
  id: string
  missionId: string
  nurseId: string
  coverLetter: string | null
  proposedRate: number | null
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
}

export interface EstablishmentProfile {
  id: string
  userId: string
  name: string
  type: string
  address: string
  phone: string
  specialties: string[]
  capacity: number | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface NurseProfile {
  id: string
  userId: string
  specializations: string[]
  experience: number
  certifications: string[]
  availability: any
  hourlyRate: number | null
  rating: number
  missionsCompleted: number
  level: number
  rank: string
  createdAt: Date
  updatedAt: Date
}

export class StorageService {
  // ==============================================================================
  // Missions
  // ==============================================================================

  async createMission(data: any): Promise<Mission> {
    return await prisma.mission.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        hourlyRate: data.hourlyRate,
        requirements: data.requirements,
        specializations: data.specializations || [],
        duration: data.duration || 8,
        establishmentId: data.establishmentId,
        status: data.status || "OPEN",
      }
    })
  }

  async getMission(id: string): Promise<Mission | null> {
    return await prisma.mission.findUnique({
      where: { id }
    })
  }

  async getMissionsByEstablishment(establishmentId: string): Promise<Mission[]> {
    return await prisma.mission.findMany({
      where: { establishmentId }
    })
  }

  async getAvailableMissions(): Promise<Mission[]> {
    return await prisma.mission.findMany({
      where: { status: "OPEN" }
    })
  }

  async updateMissionStatus(id: string, status: MissionStatus): Promise<Mission> {
    return await prisma.mission.update({
      where: { id },
      data: { status }
    })
  }

  async searchMissions(query: string, filters: any): Promise<Mission[]> {
    return await prisma.mission.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } }
        ],
        ...filters
      }
    })
  }

  // ==============================================================================
  // Candidatures
  // ==============================================================================

  async createMissionApplication(data: any): Promise<MissionApplication> {
    return await prisma.missionApplication.create({
      data: {
        missionId: data.missionId,
        nurseId: data.nurseId,
        coverLetter: data.coverLetter,
        proposedRate: data.proposedRate,
        status: data.status || "PENDING",
      }
    })
  }

  async getMissionApplication(id: string): Promise<MissionApplication | null> {
    return await prisma.missionApplication.findUnique({
      where: { id }
    })
  }

  async getMissionApplications(missionId: string): Promise<MissionApplication[]> {
    return await prisma.missionApplication.findMany({
      where: { missionId },
      include: {
        nurse: {
          include: {
            nurseProfile: true
          }
        }
      }
    })
  }

  async updateMissionApplicationStatus(
    id: string,
    status: ApplicationStatus,
    feedback?: string
  ): Promise<MissionApplication> {
    return await prisma.missionApplication.update({
      where: { id },
      data: { status }
    })
  }

  // ==============================================================================
  // Profils
  // ==============================================================================

  async getEstablishmentProfile(userId: string): Promise<EstablishmentProfile | null> {
    return await prisma.establishmentProfile.findUnique({
      where: { userId }
    })
  }

  async createEstablishmentProfile(data: any): Promise<EstablishmentProfile> {
    return await prisma.establishmentProfile.create({
      data: {
        userId: data.userId,
        name: data.name,
        type: data.type,
        address: data.address,
        phone: data.phone,
        specialties: data.specializations || [],
        capacity: data.capacity,
        description: data.description,
      }
    })
  }

  async updateEstablishmentProfile(userId: string, data: any): Promise<EstablishmentProfile | null> {
    return await prisma.establishmentProfile.update({
      where: { userId },
      data: {
        name: data.name,
        type: data.type,
        address: data.address,
        phone: data.phone,
        specialties: data.specializations,
        capacity: data.capacity,
        description: data.description,
      }
    })
  }

  async getNurseProfile(userId: string): Promise<NurseProfile | null> {
    return await prisma.nurseProfile.findUnique({
      where: { userId }
    })
  }

  // ==============================================================================
  // Statistiques
  // ==============================================================================

  async getEstablishmentStats(establishmentId: string): Promise<any> {
    const missions = await prisma.mission.count({
      where: { establishmentId }
    })

    const activeMissions = await prisma.mission.count({
      where: {
        establishmentId,
        status: "OPEN"
      }
    })

    const applications = await prisma.missionApplication.count({
      where: {
        mission: {
          establishmentId
        }
      }
    })

    const pendingApplications = await prisma.missionApplication.count({
      where: {
        mission: {
          establishmentId
        },
        status: "PENDING"
      }
    })

    return {
      totalMissions: missions,
      activeMissions,
      totalApplications: applications,
      pendingApplications,
      completionRate: missions > 0 ? ((missions - activeMissions) / missions * 100).toFixed(1) : "0"
    }
  }

  async getEstablishmentMissions(establishmentId: string, options: any): Promise<any> {
    const { status, page = 1, limit = 10 } = options
    const skip = (page - 1) * limit

    const where: any = { establishmentId }
    if (status) {
      where.status = status
    }

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          applications: {
            include: {
              nurse: {
                include: {
                  nurseProfile: true
                }
              }
            }
          }
        }
      }),
      prisma.mission.count({ where })
    ])

    return {
      data: missions,
      total
    }
  }

  // ==============================================================================
  // Utilitaires
  // ==============================================================================

  async getMissionWithApplications(missionId: string): Promise<any> {
    return await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        applications: {
          include: {
            nurse: {
              include: {
                nurseProfile: true
              }
            }
          }
        }
      }
    })
  }
}

export const storageService = new StorageService()
