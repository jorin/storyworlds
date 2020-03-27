# frozen_string_literal: true

class WorldPermissionsController < ByWorldController
  before_action :permit_modify

  def create
    return create_by_email if params[:email].present?
  end

  def update
    render_for_permission(world_permission.update(permission_params))
  end

  def destroy
    render_for_permission(world_permission.destroy)
  end

  private

  def create_by_email
    permission = params[:permission]
    user_ids = User.where(email: params[:email]).pluck(:id)

    if user_ids.present?
      permissions =
        create_user_permissions!(user_ids,
                                 update_user_permissions(user_ids,
                                                         permission))

    end

    render json: (permissions ||
                  []).map { |p| p.to_contributor_h.to_camelback_keys }
  end

  def create_user_permissions!(user_ids, permissions)
    new_user_ids = user_ids - permissions.map(&:user_id)
    if new_user_ids.present?
      permissions += new_user_ids.map do |user_id|
        world.world_permissions
             .create(permission: permission,
                     user_id: user_id)
      end
    end
    permissions
  end

  def update_user_permissions(user_ids, permission)
    permissions = world.world_permissions.where(user_id: user_ids)
    if permissions.present?
      permissions.update_all(permission: permission)
      permissions.each { |p| p.permission = permission }
    end
    permissions
  end

  def permission_params
    params.require(:world_permission).permit(:id, :permission, :user_id)
  end

  def render_for_permission(success)
    if success
      render json: world_permission.attributes.to_camelback_keys
    else
      render json: { error: world_permission.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end

  def world_permission
    @world_permission ||= world.world_permissions.find(params[:id])
  end
end
