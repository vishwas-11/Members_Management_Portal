export type Role = 'member' | 'admin'

export interface FamilyMember {
  id?: string
  name: string
  age: number
  relationship: string
}

export interface Member {
  id: string
  user_id: string
  full_name: string
  aadhaar_number: string
  address: string
  age: number
  phone: string
  role: Role
  family_members: FamilyMember[]
  declaration_signed: boolean
  declaration_signed_at?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Due {
  id: string
  member_id: string
  title: string
  amount: number
  is_paid: boolean
  due_date: string
  paid_at?: string
  created_at: string
}
