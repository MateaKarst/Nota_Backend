import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface UpdateProfileFields {
    first_name?: string;
    last_name?: string;
    avatar?: string;
    profile_description?: string;
}

export async function PUT(req: Request) {
    const cookieStore = await cookies()

    // 1️⃣ Try to get access/refresh tokens from cookies
    let access_token = cookieStore.get('access_token')?.value
    let refresh_token = cookieStore.get('refresh_token')?.value

    // 2️⃣ Fallback: Check Authorization header if access_token is not in cookies
    if (!access_token) {
        const authHeader = req.headers.get('Authorization')
        if (authHeader?.startsWith('Bearer ')) {
            access_token = authHeader.substring(7)
        }
    }

    // 3️⃣ If still no access token, reject
    if (!access_token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // 4️⃣ Get current user from Supabase Auth
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser(access_token)

    let currentUser = user

    // 5️⃣ If access_token failed, try refreshing the session using refresh_token
    if ((!currentUser || error) && refresh_token) {
        const {
            data: refreshData,
            error: refreshError,
        } = await supabase.auth.refreshSession({ refresh_token })

        if (!refreshError && refreshData.session) {
            access_token = refreshData.session.access_token
            refresh_token = refreshData.session.refresh_token

            const {
                data: { user: refreshedUser },
                error: refreshedError,
            } = await supabase.auth.getUser(access_token)

            if (refreshedUser && !refreshedError) {
                currentUser = refreshedUser
            }
        }
    }

    // 6️⃣ If still no user, reject
    if (!currentUser) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // 7️⃣ Parse incoming request JSON for fields
    const { first_name, last_name, avatar, profile_description } = await req.json()

    // 8️⃣ Fetch existing user profile from `user_details` table
    const { data: existingData, error: fetchError } = await supabase
        .from('user_details')
        .select('first_name, last_name, avatar, profile_description')
        .eq('id', currentUser.id)

    if (fetchError) {
        console.error('❌ Error fetching user profile:', fetchError.message)
        return NextResponse.json({ message: 'Error fetching user profile' }, { status: 400 })
    }

    if (!existingData || existingData.length === 0) {
        console.warn('⚠️ No profile found for user.');

        // If no profile exists, create a new profile
        const { error: createProfileError } = await supabase
            .from('user_details')
            .insert([{
                id: currentUser.id,
                first_name: first_name || '',
                last_name: last_name || '',
                avatar: avatar || '',
                profile_description: profile_description || ''
            }])

        if (createProfileError) {
            console.error('❌ Error creating user profile:', createProfileError.message)
            return NextResponse.json({ message: 'Error creating user profile' }, { status: 400 })
        }

        return NextResponse.json({
            message: 'User profile created successfully',
            updated: { first_name, last_name, avatar, profile_description }
        }, { status: 201 })
    }

    // If we have an existing profile, proceed with the update
    const currentProfile = existingData[0]

    // 9️⃣ Merge new fields with existing ones (retain previous values if field is empty or undefined)
    const updateFields: UpdateProfileFields = {
        first_name: first_name?.trim() || currentProfile.first_name,
        last_name: last_name?.trim() || currentProfile.last_name,
        avatar: avatar?.trim() || currentProfile.avatar,
        profile_description: profile_description?.trim() || currentProfile.profile_description
    }

    // 🔟 Perform update
    const { error: updateError } = await supabase
        .from('user_details')
        .update(updateFields)
        .eq('id', currentUser.id)

    if (updateError) {
        console.error('❌ Error updating user profile:', updateError.message)
        return NextResponse.json({ message: 'Failed to update user profile' }, { status: 400 })
    }

    return NextResponse.json({
        message: 'User profile updated successfully',
        updated: updateFields
    }, { status: 200 })
}
