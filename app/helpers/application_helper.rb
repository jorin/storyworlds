# frozen_string_literal: true

module ApplicationHelper
  def header_props_json
    {
      authenticity_token: form_authenticity_token,
      badge: badge_props,
      character: @character,
      location: @location,
      root_path: root_path,
      sessions_path: sessions_path,
      users_path: users_path,
      user: current_user
            &.attributes
            &.slice('email', 'first_name')
            &.to_camelback_keys,
      world: @world,
      worlds_path: worlds_path
    }.to_camelback_keys.to_json
  end

  private

  def badge_props
    if @world.present?
      badge_props = { class_name: 'badge-light', text: 'PUBLIC' }
      permission = current_user&.world_permission(@world)
      if permission.present?
        badge_props = if permission == WorldPermission::PERMISSION_MANAGE
                        { class_name: 'badge-primary', text: 'CREATOR' }
                      else
                        { class_name: "badge-#{permission}",
                          text: permission.upcase }
                      end
      end
    end

    badge_props
  end
end
