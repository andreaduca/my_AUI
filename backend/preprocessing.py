import math

MAX_CLICKS = 50
MAX_TIME_ON_PAGE = 1000

def state_to_features(state):
    """
    This function takes the state object and returns a feature vector
    :param state:
    :return: features (es. [0.0, 0.35, 0.41, 0.73, 1.0, 0.0, 0.0])
    """
    user_data = state.get("user", {})
    context_data = state.get("context", {})
    ui_data = state.get("ui", {})

    # I extract the number fields
    clicks = user_data.get("clicksCount", 0)
    time_on_page = user_data.get("timeOnPage", 0)
    scroll_depth = context_data.get("scrollDepth", 0)

    # Normalization
    clicks_norm = math.log(1 + min(clicks, MAX_CLICKS)) / math.log(1 + MAX_CLICKS)
    time_on_page_norm = math.log(1 + min(time_on_page, MAX_TIME_ON_PAGE)) / math.log(1 + MAX_TIME_ON_PAGE)
    scroll_depth_norm = scroll_depth / 100.0

    # Boolean -> 1.0 / 0.0
    my_banner_show = ui_data.get("myBanner", {}).get("show", False)
    show_feature = 1.0 if my_banner_show else 0.0

    # Categorical (deviceType)
    device_type = context_data.get("deviceType")
    # map = { 'mobile': [1,0,0], 'tablet': [0,1,0], 'desktop': [0,0,1] }
    dt_mobile  = 1.0 if device_type == 'mobile' else 0.0
    dt_tablet  = 1.0 if device_type == 'tablet' else 0.0
    dt_desktop = 1.0 if device_type == 'desktop' else 0.0

    # feature vector
    features = [
        show_feature,
        clicks_norm,
        time_on_page_norm,
        scroll_depth_norm,
        dt_mobile, dt_tablet, dt_desktop
    ]

    return features

FEATURE_VECTOR_LENGTH = len(state_to_features({}))