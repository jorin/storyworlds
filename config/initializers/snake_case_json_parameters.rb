# frozen_string_literal: true

module ActionController
  module ParamsToSnake
    extend ActiveSupport::Concern

    def process_action(*args)
      params = request.parameters.keys.each_with_object({}) do |k, p|
        v = request.parameters[k]
        p[k.underscore] = v.try(:to_snake_keys) || v
      end
      request.parameters.merge!(params)
      super
    end
  end
end

ActiveSupport.on_load(:action_controller) do
  wrap_parameters format: [:json] if respond_to?(:wrap_parameters)
  include ::ActionController::ParamsToSnake
end
