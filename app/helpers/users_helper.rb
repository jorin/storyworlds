module UsersHelper
  def users_index_props_json
    {
      user: current_user.attributes.slice(*%w[first_name email id last_name]),
      userPath: user_path(session[:user_id]),
      usersPath: users_path
    }.to_camelback_keys.to_json
  end
end
