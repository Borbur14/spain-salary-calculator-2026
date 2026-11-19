import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "python"))
import borbur_calc as b
def test_spain():
    assert b.spain_net(50000)["net"] == 35550.0
    assert b.spain_net(60000)["withholding_rate_pct"] == 24.44
def test_us():
    assert b.us_net(100000)["net"] == 79180.0
def test_dubai():
    assert b.spanish_salary_in_dubai(50000)["dubai_monthly_aed_same_net"] == 12024
def test_gratuity():
    assert b.uae_gratuity(10000, 365 * 7)["gratuity_aed"] == 55000.0
def test_dhondt():
    assert b.dhondt(7, {"A": 340000, "B": 280000, "C": 160000, "D": 60000, "E": 15000}, blank=5000)["seats"] == {"A": 3, "B": 3, "C": 1, "D": 0, "E": 0}
if __name__ == "__main__":
    for k, f in list(globals().items()):
        if k.startswith("test_"): f()
    print("all tests pass")
