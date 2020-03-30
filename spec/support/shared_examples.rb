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
