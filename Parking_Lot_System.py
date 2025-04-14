vehicle_numbers = []
a = 0  # Total slots
occupied = 0  # To track how many slots are used

def user_choosing_options():
    try:
        user_choice = int(input("\nWhat do you want to do? "))
        if user_choice == 1:
            park_vehicle()
        elif user_choice == 2:
            remove_vehicle()
        elif user_choice == 3:
            view_vehicle()
        elif user_choice == 4:
            exit_program()
        else:
            print("Choose the correct option")
            options()
    except ValueError:
        print("Please enter a valid number.")
        options()

def options():
    print("\nOptions:")
    print("1. Park a vehicle")
    print("2. Remove a vehicle")
    print("3. View parked vehicles")
    print("4. Exit")
    user_choosing_options()

def park_vehicle():
    global occupied
    if occupied < a:
        try:
            vehicle_number = int(input("Enter the registration number: "))
            if vehicle_number not in vehicle_numbers:
                vehicle_numbers.append(vehicle_number)
                occupied += 1
                print("Vehicle parked successfully.")
                print("Available slots are:", a - occupied)
            else:
                print("This vehicle is already parked.")
        except ValueError:
            print("Please enter a valid registration number.")
    else:
        print("Parking is full!")
    options()

def remove_vehicle():
    global occupied
    try:
        vehicle_number = int(input("Enter the registration number: "))
        if vehicle_number in vehicle_numbers:
            vehicle_numbers.remove(vehicle_number)
            occupied -= 1
            print("Your vehicle was removed successfully.")
            print("Available slots are:", a - occupied)
        else:
            print("There is no vehicle with this registration number.")
    except ValueError:
        print("Please enter a valid registration number.")
    options()

def view_vehicle():
    if len(vehicle_numbers) != 0:
        print("Registration Numbers of parked vehicles:", vehicle_numbers)
    else:
        print("No vehicles are parked.")
    options()

def exit_program():
    print("You have exited. Thank you!")

def main():
    global a
    try:
        a = int(input("Enter the total number of parking slots: "))
        if a <= 0:
            print("No slots are available! Thank you for choosing us!")
        else:
            options()
    except ValueError:
        print("The given value should be an integer.")
        main()

main()
