# frozen_string_literal: true

# controllers
RSpec.shared_examples 'read world items' do
  let(:collection) do
    described_class.to_s.underscore.gsub(/_controller$/, '')
  end
  let(:creator) { create :user }
  let(:world) { create :world, creator: creator }
  let!(:items) do
    create_list collection.singularize.to_sym, 2, world: world
  end

  shared_examples 'reads collection' do
    before { get :index, params: { world_slug: world.slug } }

    it { expect(response).to have_http_status :success }
    it do
      expect(JSON.parse(response.body)[collection])
        .to contain_exactly(*(items.map { |i| hash_including('id' => i.id) }))
    end
  end

  context 'when not logged in' do
    before { get :index, params: { world_slug: world.slug } }

    it { expect(response).to have_http_status :success }
    it { expect(response).to render_template 'worlds/index' }
  end

  context 'when the world is open' do
    let(:world) { create :world, open: true }

    it_behaves_like 'reads collection'
  end

  context 'when logged in' do
    context 'when no permissions' do
      before { login }

      it do
        expect { get :index, params: { world_slug: world.slug } }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end

    context 'when creator' do
      before { login(creator) }

      it_behaves_like 'reads collection'
    end

    shared_examples 'permitted user' do
      before do
        user = create :user
        world.world_permissions
             .create user: user, permission: permission
        login(user)
      end

      it_behaves_like 'reads collection'
    end

    context 'when writer' do
      let(:permission) { WorldPermission::PERMISSION_WRITE }

      it_behaves_like 'permitted user'
    end

    context 'when reader' do
      let(:permission) { WorldPermission::PERMISSION_READ }

      it_behaves_like 'permitted user'
    end
  end
end

RSpec.shared_examples 'name-searchable world items' do
  let(:collection) do
    described_class.to_s.underscore.gsub(/_controller$/, '')
  end
  let(:item_type) { collection.singularize.to_sym }
  let(:world) { create :world }
  let!(:item1) { create item_type, name: 'Apple', world: world }
  let!(:item2) { create item_type, name: 'Banana', world: world }
  let!(:item3) { create item_type, name: 'Crabapple', world: world }
  before do
    login(world.creator)
    get :index, params: { search: 'appl', world_slug: world.slug }
  end

  it do
    expect(JSON.parse(response.body)[collection])
      .to contain_exactly(hash_including('id' => item1.id),
                          hash_including('id' => item3.id))
  end
end

RSpec.shared_examples 'create world item' do
  let(:item_type) do
    described_class.to_s
                   .underscore
                   .gsub(/_controller$/, '')
                   .singularize.to_sym
  end
  let(:world) { create :world }
  let(:item_attributes) { attributes_for item_type }
  let(:create_params) do
    { world_slug: world.slug,
      item_type => item_attributes }
  end

  shared_examples 'allowed' do
    before { post :create, format: :json, params: create_params }

    it { expect(response).to have_http_status :success }
    it do
      expect(JSON.parse(response.body))
        .to include(item_attributes.to_camelback_keys.stringify_keys)
    end
  end

  shared_examples 'disallowed' do
    it do
      expect { post :create, format: :json, params: create_params }
        .to raise_error an_instance_of(ActionController::RoutingError)
    end
  end

  context 'when not logged in' do
    it_behaves_like 'disallowed'
  end

  context 'when no permissions' do
    before { login }

    it_behaves_like 'disallowed'
  end

  context 'when read permission' do
    before do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_READ
      login(user)
    end

    it_behaves_like 'disallowed'
  end

  context 'when write permission' do
    before do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_WRITE
      login(user)
    end

    it_behaves_like 'allowed'
  end

  context 'when creator' do
    before { login(world.creator) }

    it_behaves_like 'allowed'
  end

  context 'when invalid params' do
    before do
      login(world.creator)
      post :create, format: :json,
                    params: { world_slug: world.slug,
                              item_type => { starts: 50 } }
    end

    it { expect(response).to have_http_status :bad_request }
    it { expect(JSON.parse(response.body)['error']).to be_present }
  end
end

RSpec.shared_examples 'update world item' do
  let(:item_type) do
    described_class.to_s
                   .underscore
                   .gsub(/_controller$/, '')
                   .singularize.to_sym
  end
  let(:world) { create :world }
  let(:item) { create item_type, world: world }
  let(:item_attributes) { { name: Faker::Lorem.word } }
  let(:update_params) do
    { id: item.id,
      world_slug: world.slug,
      item_type => item_attributes }
  end

  shared_examples 'allowed' do
    before { patch :update, format: :json, params: update_params }

    it { expect(response).to have_http_status :success }
    it do
      expect(JSON.parse(response.body))
        .to include(item_attributes.to_camelback_keys.stringify_keys)
    end
  end

  shared_examples 'disallowed' do
    it do
      expect { patch :update, format: :json, params: update_params }
        .to raise_error an_instance_of(ActionController::RoutingError)
    end
  end

  context 'when not logged in' do
    it_behaves_like 'disallowed'
  end

  context 'when no permissions' do
    before { login }

    it_behaves_like 'disallowed'
  end

  context 'when read permission' do
    before do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_READ
      login(user)
    end

    it_behaves_like 'disallowed'
  end

  context 'when write permission' do
    let(:user) do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_WRITE
      user
    end
    before { login(user) }

    it_behaves_like 'disallowed'

    context 'when created item' do
      let(:item) { create item_type, creator: user, world: world }

      it_behaves_like 'allowed'
    end
  end

  context 'when creator' do
    before { login(world.creator) }

    it_behaves_like 'allowed'
  end

  context 'when invalid params' do
    before do
      login(world.creator)
      patch :update, format: :json,
                     params: { id: item.id,
                               world_slug: world.slug,
                               item_type => { name: nil } }
    end

    it { expect(response).to have_http_status :bad_request }
    it { expect(JSON.parse(response.body)['error']).to be_present }
  end
end

# models
RSpec.shared_examples 'has optional timeline' do
  let(:starts) { nil }
  let(:ends) { nil }
  subject do
    build described_class.to_s.underscore.to_sym,
          starts: starts, ends: ends
  end

  it { is_expected.to be_valid }

  context 'when starts' do
    let(:starts) { 1000 }

    it { is_expected.to be_valid }
  end

  context 'when ends' do
    let(:ends) { 1000 }

    it { is_expected.to be_valid }
  end

  context 'when starts before ends' do
    let(:starts) { 1000 }
    let(:ends) { 2000 }

    it { is_expected.to be_valid }
  end

  context 'when starts is ends' do
    let(:starts) { 1000 }
    let(:ends) { 1000 }

    it { is_expected.to be_valid }
  end

  context 'when starts after ends' do
    let(:starts) { 2000 }
    let(:ends) { 1000 }

    it { is_expected.to_not be_valid }
  end
end
